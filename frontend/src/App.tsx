import React from 'react';
import logo from './logo.svg';
import './App.css';
import TerminalComponent from './components/Terminal';

function App() {
  return (
    <div className="App">
      <h1>Welcome to SSH Terminal App</h1>
      <TerminalComponent  /> {/* Вставляем компонент терминала */}
    </div>
  );
}

export default App;
