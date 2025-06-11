import React, { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import "./Terminal.css";
import { Client } from "@stomp/stompjs";
import { useInitshellMutation, useDisconnectSessionMutation } from "../../api/sshApi";
import SockJS from "sockjs-client";
import { useDispatch } from "react-redux";
import { setCurrentConnection } from "../../slice/sshConnectionSlice";
import TerminalSettingsMenu from "../TerminalSettings/TerminalSettings";

interface XTermConsoleProps {
  sessionId: number;
}

const XTermConsole: React.FC<XTermConsoleProps> = ({ sessionId }) => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const stompClient = useRef<Client | null>(null);
  const inputCursorRef = useRef<number>(0);
  const promptLineRef = useRef<string>("");

  const [shellInit] = useInitshellMutation();
  const [disconnect] = useDisconnectSessionMutation();
  const dispatch = useDispatch();

  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const currentInput = useRef("");
  const history = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);
  const lastCommand = useRef<string>("");

  const themes = {
    dark: { 
      background: "#300824", 
      foreground: "#ffffff", 
      cursor: "#ffffff" },
    light: { 
      background: "#f5f5f5", 
      foreground: "#000000", 
      cursor: "#000000" 
    },
  };

  function redrawInputLine(terminal: Terminal, input: string, cursorPos: number) {
    terminal.write("\x1b[2K\r" + promptLineRef.current + input);
    const moveLeft = input.length - cursorPos;
    if (moveLeft > 0) terminal.write(`\x1b[${moveLeft}D`);
  }

  useLayoutEffect(() => {
    if (!terminalRef.current) return;
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize,
      fontFamily: "Ubuntu Mono, monospace",
      theme: themes[theme],
    });
    term.current = terminal;
    fitAddon.current = new FitAddon();
    terminal.loadAddon(fitAddon.current);
    terminal.open(terminalRef.current);
    terminal.focus();
    fitAddon.current.fit();

    terminal.onData((data) => {
      let input = currentInput.current;
      let cursorPos = inputCursorRef.current;
      switch (data) {
        case "\r": {
          const cmd = input.trim();
          terminal.write("\r\n");
          if (cmd) {
            stompClient.current?.publish({ destination: "/app/execute", body: JSON.stringify({ command: cmd, sessionId: String(sessionId) }) });
            history.current.push(cmd);
            historyIndex.current = history.current.length;
            lastCommand.current = cmd;
          }
          input = "";
          cursorPos = 0;
          break;
        }
        case "\u0003": {
          terminal.write("^C\r\n");
          input = "";
          cursorPos = 0;
          break;
        }
        case "\u007f": {
          if (cursorPos > 0) {
            input = input.slice(0, cursorPos - 1) + input.slice(cursorPos);
            cursorPos--;
            redrawInputLine(terminal, input, cursorPos);
          }
          break;
        }
        case "\x1b[D": if (cursorPos > 0) { cursorPos--; terminal.write("\x1b[D"); } break;
        case "\x1b[C": if (cursorPos < input.length) { cursorPos++; terminal.write("\x1b[C"); } break;
        case "\x1b[A": {
          if (historyIndex.current > 0) {
            historyIndex.current--;
            input = history.current[historyIndex.current];
            cursorPos = input.length;
            redrawInputLine(terminal, input, cursorPos);
          }
          break;
        }
        case "\x1b[B": {
          if (historyIndex.current < history.current.length - 1) {
            historyIndex.current++;
            input = history.current[historyIndex.current];
          } else {
            historyIndex.current = history.current.length;
            input = "";
          }
          cursorPos = input.length;
          redrawInputLine(terminal, input, cursorPos);
          break;
        }
        default: {
          input = input.slice(0, cursorPos) + data + input.slice(cursorPos);
          cursorPos += data.length;
          redrawInputLine(terminal, input, cursorPos);
        }
      }
      currentInput.current = input;
      inputCursorRef.current = cursorPos;
      fitAddon.current?.fit();
      terminal.scrollToBottom();
    });

    stompClient.current = new Client({
      brokerURL: "https://pilipenkoaleksey.ru/ws/ssh",
      webSocketFactory: () => new SockJS("https://pilipenkoaleksey.ru/ws/ssh"),
      connectHeaders: {},
      debug: () => {},
      onConnect: () => {
        shellInit(sessionId);
        stompClient.current?.subscribe(`/topic/response/${sessionId}`, (msg) => {
          const body = msg.body;
          if (term.current) {
            if (body.endsWith("# ") || body.endsWith("$ ")) {
              promptLineRef.current = body;
              currentInput.current = "";
              inputCursorRef.current = 0;
            }
            const out = lastCommand.current ? body.replace(lastCommand.current, "") : body;
            term.current.write(out);
          }
        });
        stompClient.current?.subscribe(`/topic/exception/${sessionId}`, (msg) => {
          dispatch(setCurrentConnection(null));
          alert(`Ошибка: ${msg.body}`);
        });
      },
      onStompError: () => {},
      onWebSocketError: () => {},
      onWebSocketClose: () => {}
    });
    stompClient.current.activate();

    return () => {
      stompClient.current?.deactivate();
      term.current?.dispose();
      disconnect(sessionId).unwrap().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (term.current) {
      term.current.options.fontSize = fontSize;
      term.current.options.theme = themes[theme];
      fitAddon.current?.fit();
    }
  }, [fontSize, theme]);

  return (
    <>  
      <TerminalSettingsMenu
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        theme={theme}
        onThemeChange={setTheme}
      />
      <div className="terminal-container">
        <div className="title-bar">
          <div className="buttons">
            <div className="button button-red" />
            <div className="button button-yellow" />
            <div className="button button-green" />
          </div>
          <span className="window-title" />
        </div>
        <div ref={terminalRef} className="terminal" tabIndex={0} />
      </div>
    </>
  );
};

export default XTermConsole;
