import React, { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import "./Terminal.css";

const XTermConsole: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [input, setInput] = useState(""); // Введенная команда
  const [currentDir] = useState("user@ubuntu:~$ "); // Текущая директория (не изменяется)

  // Ссылки для ввода и для хранения строки
  const inputRef = useRef<string>("");

  useLayoutEffect(() => {
    setTimeout(() => setIsMounted(true), 300);
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


    setTimeout(() => {
      fitAddon.current?.fit();
      term.current?.write(currentDir); // Печатаем строку подсказки
    }, 100);

    // Слушаем ввод с клавиатуры
    term.current.onData(data => {
      if (data === '\r') { // Нажат Enter
        term.current?.write("\r\n");
        term.current?.write(currentDir); // Печатаем строку подсказки снова
        if (input.trim() === "ls") {
          term.current?.write("\r\nfile1.txt  file2.txt  file3.txt");
        } else if (input.trim()) {
          term.current?.write("\r\nCommand not found: " + input);
        }
        setInput(""); // Сброс ввода после выполнения команды
        inputRef.current = ""; // Сбрасываем также inputRef
      } else if (data === '\u007f') { // Обработка backspace
        if (inputRef.current.length > 0) { // Если есть введенные символы
          inputRef.current = inputRef.current.slice(0, -1); // Удаляем последний символ из inputRef
          term.current?.write("\b \b"); // Удаляем символ в терминале
        }
      } else { // Обычные символы
        inputRef.current += data; // Добавляем символ в inputRef
        term.current?.write(data); // Печатаем символ в терминале
      }
      setInput(inputRef.current); // Обновляем состояние с новым вводом

      // Прокручиваем терминал, чтобы всегда была видна последняя строка
      fitAddon.current?.fit();
      term.current?.scrollToBottom();
    });

    return () => {
      term.current?.dispose();
    };
  }, [isMounted, currentDir]); // Следим за изменениями currentDir

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
      <div ref={terminalRef} className="terminal" />
    </div>

  );
};

export default XTermConsole;