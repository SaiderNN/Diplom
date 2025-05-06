import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ConnectRequest, useConnectMutation } from "../../api/sshApi";
import { RootState } from "../../store/store";
import "./SshConnectionPage.css"; // Подключаем стили
import XTermConsole from "../../components/Terminal/Terminal";
import { addConnection } from "../../slice/sshConnectionSlice";




const SshConnectionPage: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [host, setHost] = useState("");
  const [port, setPort] = useState(22);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [useKeyAuth, setUseKeyAuth] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(Boolean); // Состояние для отображения шторки
  const [session, setSessionId] = useState(-1);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [connect, { isLoading, error }] = useConnectMutation();
  const handleConnect = async () => {
    setConsoleOutput((prev) => [...prev, "Подключение к серверу..."]);
   // Показываем шторку

    try {
      // Формируем объект запроса без undefined значений
      const authData: ConnectRequest = useKeyAuth
        ? { host, port, username, key } // Подключение по SSH-ключу
        : { host, port, username, password }; // Подключение по паролю

      const result = await connect(authData).unwrap();

      if(result.status == 200)
      {
        dispatch(addConnection({ sessionId: result.session_id, host:host, username:username  }));
        setSessionId(result.session_id)
        setIsConnected(true);
        setConsoleOutput((prev) => [...prev, "Успешное подключение!"]);
        console.log(result)
        console.log(session)
        console.log(isConnected)
        //navigate("/terminal");
       
      }
      else{

      }
    
    } catch (err) {
      setConsoleOutput((prev) => [...prev, "Ошибка подключения"]);
      console.log(err);
  };
}

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="ssh-container">
      {/* Левая часть — Форма подключения */}
      {(session == -1) && 
      <div className="ssh-box">
        <h2>SSH Подключение</h2>

        <label>Хост:</label>
        <input type="text" value={host} onChange={(e) => setHost(e.target.value)} placeholder="" />

        <label>Порт:</label>
        <input type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} placeholder="22" />

        <label>Имя пользователя:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="" />

        {/* Переключатель режима подключения */}
        <div className="auth-toggle">
          <label>
            <input type="radio" name="authMethod" checked={!useKeyAuth} onChange={() => setUseKeyAuth(false)} />
            Пароль
          </label>
          <label>
            <input type="radio"  name="authMethod" checked={useKeyAuth} onChange={() => setUseKeyAuth(true)} />
            SSH-ключ
          </label>
        </div>

        {useKeyAuth ? (
          <>
            <label>SSH-ключ:</label>
            <textarea value={key} onChange={(e) => setKey(e.target.value)} placeholder="Вставьте ваш приватный ключ" />
          </>
        ) : (
          <>
            <label>Пароль:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" />
          </>
        )}

        <button onClick={handleConnect} disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить"}
        </button>

        {error && <p className="error-message">Ошибка подключения</p>}
      </div>}

           {/* Правая часть — Терминал */}
     {/* {(session!= -1) && <XTermConsole sessionId= {session}/>}*/}

   
      
    </div>
  );
};

export default SshConnectionPage;
