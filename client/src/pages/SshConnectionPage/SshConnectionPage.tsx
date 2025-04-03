import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useConnectMutation } from "../../api/sshApi";
import { setConnectionStatus } from "../../slice/sshSlice";
import { RootState } from "../../store/store";

const SshConnectionPage: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated); // Проверка авторизации
  
  const [host, setHost] = useState("");
  const [port, setPort] = useState(22);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [connect, { isLoading, error }] = useConnectMutation();
  const handleConnect = async () => {
    try {
      const response =  await connect({ host, port, username, password }).unwrap();
      
      if (true) {
        dispatch(setConnectionStatus(true));  // Обновляем статус соединения
        navigate("/terminal"); // Переход на страницу терминала
      }
    } catch (error) {
      console.error("Ошибка подключения:", error);
    }
  };
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); 
    }
  }, [isAuthenticated, navigate, dispatch]);
  

  return (
    <div>
      <h2>SSH Подключение</h2>
      <input type="text" placeholder="Хост" value={host} onChange={(e) => setHost(e.target.value)} />
      <input type="number" placeholder="Порт" value={port} onChange={(e) => setPort(Number(e.target.value))} />
      <input type="text" placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleConnect}>Подключиться</button>
    </div>
  );
};

export default SshConnectionPage;
