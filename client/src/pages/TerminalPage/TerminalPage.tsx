// src/pages/TerminalPage.tsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setCurrentConnection } from "../../slice/sshConnectionSlice";
import XTermConsole from "../../components/Terminal/Terminal";
import { useNavigate } from "react-router-dom";
import "./TerminalPage.css"; 



const TerminalPage = () => {
  const dispatch = useDispatch();
  const currentConnection = useSelector((state: RootState) => state.ssh.currentConnection);
  const navigate = useNavigate();
  const termTheme = useSelector((state: RootState) => state.term.theme);
 

  useEffect(() => {
    if (!currentConnection) {
      navigate("/"); // Если нет активного соединения, перенаправляем на главную
    }

  }, [currentConnection, navigate, termTheme]);

  const handleGoBack = () => {
    dispatch(setCurrentConnection(null)); // Сбрасываем текущее соединение при нажатии на "Назад"
    navigate("/"); // Перенаправляем обратно на страницу с соединениями
  };

  if (!currentConnection) {
    return <div>Нет активного соединения.</div>; // Если нет соединения, показываем сообщение
  }

  return (
    <div className="terminal-page"  style={{ backgroundColor: termTheme === "dark" ? "#8d196a" : "#e0f7fa" }}>
      <XTermConsole sessionId={currentConnection.sessionId} />
      <button className="back-button" onClick={handleGoBack}>
        Отключиться
      </button>
    </div>
  );
};

export default TerminalPage;
