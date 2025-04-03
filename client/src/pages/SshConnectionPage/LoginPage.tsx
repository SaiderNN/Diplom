import React from 'react';
import { useForm } from 'react-hook-form';
import { useLoginMutation } from '../../api/authApi';
import { useDispatch } from 'react-redux';
import { clearTokens,  setTokens } from '../../slice/authSlice';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { register, handleSubmit } = useForm<{ username: string; password: string }>();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: { username: string; password: string }) => {
    try {
     
      const result = await login(data).unwrap();
      console.log("Login successful!", result);
      dispatch(clearTokens());
      dispatch(setTokens({
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
      }));
     
      navigate("/"); 
    } catch (err) {
      console.error("Login failed:", err);
      alert("Ошибка авторизации");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('username')} placeholder='Username' required />
        <input {...register('password')} type='password' placeholder='Password' required />
        <button type='submit' disabled={isLoading}>Login</button>
      </form>
    </div>
  );
};

export default LoginPage;