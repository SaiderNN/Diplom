import React from 'react';
import logo from './logo.svg';
import './App.css';

import {Route, Routes } from 'react-router-dom';
import XTermConsole from './components/Terminal/Terminal';
import SshConnectPage from './pages/SshConnectionPage/SshConnectionPage';
import LoginPage from './pages/SshConnectionPage/LoginPage';



const App: React.FC = () => {
  return (
   
      <Routes>
        <Route path="/" element={<SshConnectPage />} /> 
        <Route path="/terminal" element={<XTermConsole />} /> 
        <Route path="/login" element={<LoginPage />} /> 
      </Routes>
    
  );
};

export default App;
