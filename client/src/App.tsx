import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import {Route, Routes } from 'react-router-dom';
import XTermConsole from './components/Terminal/Terminal';
import SshConnectPage from './components/SshConnectionDialog/SshConnectionPage';
import LoginPage from './pages/LoginPage/LoginPage';
import { AppDispatch } from './store/store';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './thunks/authThunks';
import { setIsRefreshing } from './slice/authSlice';



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
        <Route path="/" element={<SshConnectPage />} /> 
        <Route path="/login" element={<LoginPage />} /> 
      </Routes>
    
  );
};

export default App;
