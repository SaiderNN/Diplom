import React, { useState } from 'react';
import { useLoginMutation } from '../../api/authApi';
import { useDispatch } from 'react-redux';
import { clearTokens, setTokens } from '../../slice/authSlice';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Импорт CSS

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      const result = await login({ email, password }).unwrap();
      console.log('Login successful!', result);
      dispatch(clearTokens());
      dispatch(setTokens({
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
      }));
      
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      alert('Ошибка авторизации');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text"
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
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
