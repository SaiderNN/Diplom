import React, { useState } from 'react';
import { useLoginMutation } from '../../api/authApi';
import { useDispatch } from 'react-redux';
import { clearTokens, setTokens } from '../../slice/authSlice';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setUsername] = useState("");
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
      console.log(email);
      console.log(password);
      alert('Ошибка авторизации');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          value={email}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username" 
          required 
        />
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" 
          required 
        />
        <button type="submit" disabled={isLoading}>Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
