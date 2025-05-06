import React, { useState } from 'react';
import { useLoginMutation } from '../../api/authApi';
import { useDispatch } from 'react-redux';
import { clearTokens, setTokens } from '../../slice/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useGetUserIdQuery } from "../../api/profileApi";
import { setUserId } from '../../slice/profileSlice';


import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: userIdData, refetch: refetchUserId } = useGetUserIdQuery();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(clearTokens());
      dispatch(setTokens({
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
      }));
      const { data: userIdData } = await refetchUserId();
      console.log(userIdData?.id)
      dispatch(setUserId(userIdData?.id ?? null));
      navigate('/');
    } catch (err) {
      alert('Ошибка авторизации');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Вход</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" 
            required 
          />
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" 
            required 
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Войти"}
          </button>
        </form>
        <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
