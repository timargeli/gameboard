import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
//import BackendURL from '../../shared/src/env'

function App() {
  const [helloWorld, setHelloWorld] = useState<string>('')

  useEffect(() => {
    fetch('http://localhost:3001/')
      .then(response => response.json())
      .then(data => setHelloWorld(data.message));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
          Moshi Moshi is this working?: {helloWorld}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
