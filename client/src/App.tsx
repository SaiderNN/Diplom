import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import {Route, Routes } from 'react-router-dom';
import XTermConsole from './components/Terminal/Terminal';
import SshConnectionPage from './pages/SshConnectionPage/SshConnectionPage';
import LoginPage from './pages/LoginPage/LoginPage';
import { AppDispatch } from './store/store';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './thunks/authThunks';
import { setIsRefreshing } from './slice/authSlice';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import RefugePage from './pages/RefugePage/RefugePage';
import TerminalPage from './pages/TerminalPage/TerminalPage';


const App: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false); 
  const isRefreshing = useSelector((state: any) => state.auth.isRefreshing);
  useEffect(() => {
    const initializeAuthentication = async () => {
      if(!isRefreshing){
        await dispatch(initializeAuth());
      }
      setIsAuthInitialized(true); 
    };
    initializeAuthentication();
  }, [dispatch]);
  
 
  if (!isAuthInitialized) {

    return <div>Загрузка приложения...</div>;
  }

  return (
   
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RefugePage />} />
      <Route path="/connect/new" element={<SshConnectionPage />} />
      <Route path="/terminal" element={<TerminalPage />} />  {/* Новый маршрут для терминала */}
    </Routes>
    
  );
};

export default App;
