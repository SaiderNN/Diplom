import React, { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import "./Terminal.css";
import { Client } from "@stomp/stompjs";
import { useInitshellMutation } from "../../api/sshApi";
import SockJS from "sockjs-client";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCurrentConnection } from "../../slice/sshConnectionSlice";

interface XTermConsoleProps {
  sessionId: number; // Ваш параметр, например, строка
}

const XTermConsole: React.FC<XTermConsoleProps> = ({ sessionId }) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const [input, setInput] = useState(""); // Введенная команда
  const [messages, setMessages] = useState<string[]>([]); // Сообщения от сервера
  const stompClient = useRef<Client | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const inputCursorRef = useRef<number>(0); // позиция курсора
  const promptLineRef = useRef<string>(""); // вся строка последнего приглашения
  const [shellInit, { isLoading, error }] = useInitshellMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function redrawInputLine(terminal: Terminal, input: string, cursorPos: number) {
    const prompt = promptLineRef.current;
  
    // Очистка строки и возврат курсора
    terminal.write("\x1b[2K\r");
  
    // Переотрисовка строки с prompt и вводом
    terminal.write(prompt + input);
  
    // Сдвигаем курсор назад, если он не в конце
    const moveLeft = input.length - cursorPos;
    if (moveLeft > 0) {
      terminal.write(`\x1b[${moveLeft}D`);
    }
  }
  
  

  useLayoutEffect(() => {
    if (terminalRef.current) {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!isMounted || !terminalRef.current) return;
    term.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "Ubuntu Mono, monospace",
      theme: {
        background: "#300A24",
        foreground: "#E0E0E0",
        cursor: "#FF7800",
      },
    });
  
    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);
    term.current.open(terminalRef.current);
    term.current.focus();
    fitAddon.current.fit();
  
    let currentInput = ""; // переменная для текущей команды
    let lastCommand = ""; // хранение последней команды, чтобы не выводить её снова
  
    term.current.onData((data) => {
      const allowedChars = /^[a-zA-Z0-9\-_.\/"'\s]*$/;
  
      if (!term.current) return;
  
      let inputStr = currentInput;
      let cursorPos = inputCursorRef.current ?? inputStr.length;
  
      // Обработка нажатия Enter
      if (data === "\r") {
        const trimmed = inputStr.trim();
        term.current.write("\r\n"); // перенос строки, но вывод команды не происходит
  
        if (trimmed.length > 0) {
          // Отправляем команду по WebSocket
          stompClient.current?.publish({
            destination: "/app/execute",
            body: JSON.stringify({ command: trimmed, sessionId: String(sessionId) }),
          });
          console.log("📤 Отправлена команда:", trimmed, String(sessionId));
  
          // Очищаем строку ввода, но не выводим её в терминале
          currentInput = "";
          inputCursorRef.current = 0;
          lastCommand = trimmed; // сохраняем команду для исключения дублирования
        }
      }
  
      // Обработка Backspace, стрелок и других символов
      else if (data === "\u007f") {
        if (cursorPos > 0) {
          inputStr = inputStr.slice(0, cursorPos - 1) + inputStr.slice(cursorPos);
          cursorPos--;
          redrawInputLine(term.current, inputStr, cursorPos);
        }
      }
  
      else if (data === "\x1b[D") {
        if (cursorPos > 0) {
          cursorPos--;
          term.current.write("\x1b[D");
        }
      }
  
      else if (data === "\x1b[C") {
        if (cursorPos < inputStr.length) {
          cursorPos++;
          term.current.write("\x1b[C");
        }
      }
  
      else if (allowedChars.test(data)) {
        inputStr = inputStr.slice(0, cursorPos) + data + inputStr.slice(cursorPos);
        cursorPos++;
        redrawInputLine(term.current, inputStr, cursorPos);
      }
  
      currentInput = inputStr;
      inputCursorRef.current = cursorPos;
  
      fitAddon.current?.fit();
      term.current?.scrollToBottom();
    });
  
    // STOMP client init + ЛОГИ
    stompClient.current = new Client({
      brokerURL: /*"wss://pilipenkoaleksey.ru/ws/ssh"*/ "wss://localhost:8080/ws/ssh",
      connectHeaders: {},
      debug: (str) => {
        console.log(`[STOMP DEBUG]: ${str}`);
      },
      onConnect: (frame) => {
        console.log("[✅ STOMP CONNECTED]:", frame);
        shellInit(sessionId);
        stompClient.current?.subscribe(`/topic/response/${sessionId}`, (message) => {
          let body = message.body;
          if (!term.current) return;
        
          // Если приходит новая строка — сохраняем prompt
          if (body.endsWith("# ") || body.endsWith("$ ")) {
            promptLineRef.current = body;
        
            // Очистка текущего ввода и обновление позиции курсора
            currentInput = "";
            inputCursorRef.current = 0;
          }
        
          // Находим первое вхождение lastCommand в body и удаляем его
          if (lastCommand) {
            body = body.replace(lastCommand, ""); // Убираем только первое вхождение команды
          }
        
          // Выводим изменённый ответ
          term.current.write(body); // Выводим ответ без лишнего "\r"
        });
        stompClient.current?.subscribe(`/topic/exception/${sessionId}`, (message) => {
          let body = message.body;
          if (!term.current) return;
         dispatch(setCurrentConnection(null));
          
        });
        
      },
      onStompError: (frame) => {
        console.error("[❌ STOMP ERROR]:", frame.headers["message"], frame.body);
      },
      onWebSocketError: (event) => {
        console.error("[❌ WebSocket Error]:", event);
      },
      onWebSocketClose: (event) => {
        console.warn("[⚠️ WebSocket Closed]:", event);
      },
      webSocketFactory: () => new SockJS(/*"https://pilipenkoaleksey.ru/ws/ssh"*/"http://localhost:8080/ws/ssh"),
    });
  
    stompClient.current.activate();
    return () => {
      stompClient.current?.deactivate();
      term.current?.dispose();
    };
  }, [isMounted]);
  

  return (
    <div className="terminal-container">
      <div className="title-bar">
        <div className="buttons">
          <div className="button button-red" />
          <div className="button button-yellow" />
          <div className="button button-green" />
        </div>
        <span className="window-title"></span>
      </div>
      <div ref={terminalRef} className="terminal" tabIndex={0} />
    </div>
  );
};

export default XTermConsole;
