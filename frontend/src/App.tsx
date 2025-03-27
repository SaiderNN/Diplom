import React from 'react';
import logo from './logo.svg';
import './App.css';
import TerminalComponent from './components/Terminal';
import XTermConsole from './components/Terminal';


function App() {
  return (
    <div className="App" >
      <XTermConsole />{/* Вставляем компонент терминала */}
    </div>
  );
}

export default App;
