import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ConnectRequest,
  useConnectMutation,
  useUpdateSessionMutation,
} from "../../api/sshApi";
import { RootState } from "../../store/store";
import "./SshConnectionPage.css";
import { addConnection } from "../../slice/sshConnectionSlice";

const SshConnectionPage: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [host, setHost] = useState("");
  const [port, setPort] = useState(22);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [useKeyAuth, setUseKeyAuth] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [session, setSessionId] = useState(-1);

  const [connect, { isLoading: isConnecting, error: connectError }] = useConnectMutation();
  const [updateSession, { isLoading: isUpdating, error: updateError }] = useUpdateSessionMutation();

  const editMode = location.state?.edit === true;
  const existingData = location.state?.data;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (editMode && existingData) {
      setHost(existingData.host);
      setPort(22); // или existingData.port, если он есть
      setUsername(existingData.username);
    }
  }, [editMode, existingData]);

  const handleConnect = async () => {
    setConsoleOutput((prev) => [...prev, editMode ? "Обновление сессии..." : "Подключение к серверу..."]);

    try {
      const authData: ConnectRequest = useKeyAuth
        ? { host, port, username, key }
        : { host, port, username, password };

      if (editMode && existingData?.sessionId) {
        const result = await updateSession({
          sessionId: existingData.sessionId,
          data: authData, 
        }).unwrap();
        setConsoleOutput((prev) => [...prev, result.message || "Сессия обновлена"]);
      } else {
        const result = await connect(authData).unwrap();

        if (result.status === 200) {
          dispatch(addConnection({ sessionId: result.session_id, host, username }));
          setSessionId(result.session_id);
          setIsConnected(true);
          setConsoleOutput((prev) => [...prev, "Успешное подключение!"]);
        } else {
          setConsoleOutput((prev) => [...prev, "Ошибка: неверный статус подключения"]);
        }
      }
      navigate("/"); 
    } catch (err) {
      setConsoleOutput((prev) => [...prev, "Ошибка подключения"]);
      console.error(err);
    }
  };

  return (
    <div className="ssh-container">
      {session === -1 && (
        <div className="ssh-box">
          <h2>{editMode ? "Редактирование подключения" : "SSH Подключение"}</h2>

          <label>Хост:</label>
          <input type="text" value={host} onChange={(e) => setHost(e.target.value)} />

          <label>Порт:</label>
          <input type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} />

          <label>Имя пользователя:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />

          <div className="auth-toggle">
            <label>
              <input
                type="radio"
                name="authMethod"
                checked={!useKeyAuth}
                onChange={() => setUseKeyAuth(false)}
              />
              Пароль
            </label>
            <label>
              <input
                type="radio"
                name="authMethod"
                checked={useKeyAuth}
                onChange={() => setUseKeyAuth(true)}
              />
              SSH-ключ
            </label>
          </div>

          {useKeyAuth ? (
            <>
              <label>SSH-ключ:</label>
              <textarea
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Вставьте ваш приватный ключ"
              />
            </>
          ) : (
            <>
              <label>Пароль:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
              />
            </>
          )}

          <button onClick={handleConnect} disabled={isConnecting || isUpdating}>
            {(isConnecting || isUpdating) ? "Сохранение..." : "Сохранить"}
          </button>
          <button onClick={() => navigate("/")} className="back-button">
            ⬅ Назад
          </button>

          {(connectError || updateError) && (
            <p className="error-message">Ошибка подключения</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SshConnectionPage;
