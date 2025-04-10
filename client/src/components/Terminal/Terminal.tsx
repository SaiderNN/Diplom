import React, { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import "./Terminal.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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

  const [isMounted, setIsMounted] = useState(false);

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

    // Подключаем WebSocket
    stompClient.current = new Client({
      brokerURL: "wss://pilipenkoaleksey.ru/ws/ssh",
      connectHeaders: {},
      debug: (str) => console.log(`[STOMP DEBUG]: ${str}`),
      onConnect: (frame) => {
        console.log("[✅ STOMP CONNECTED]:", frame);
        stompClient.current?.subscribe(`/topic/response/${sessionId}`, (message) => {
          let body = message.body;
          if (!term.current) return;

          if (body.endsWith("# ") || body.endsWith("$ ")) {
            promptLineRef.current = body;
            term.current.write("\r\n");
          }

          term.current.write(body);
        });
      },
      onStompError: (frame) => {
        console.error("[❌ STOMP ERROR]:", frame.headers["message"], frame.body);
      },
      webSocketFactory: () => new SockJS("https://pilipenkoaleksey.ru/ws/ssh"),
    });

    stompClient.current.activate();

    return () => {
      stompClient.current?.deactivate();
      term.current?.dispose();
    };
  }, [isMounted, sessionId]);

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
