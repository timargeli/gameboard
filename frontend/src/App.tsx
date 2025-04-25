import React from 'react'
import logo from './logo.svg'
import './App.css'
import { useEffect, useState } from 'react'
import { KingdomMap } from './boardgames/kingdomino/kingdom/kingdom-map'
import { Topdecks } from './boardgames/kingdomino/topdeck/topdecks'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Kingdomino from './boardgames/kingdomino/kingdomino'
import { BACKEND_URL } from './types'
//import BackendURL from '../../shared/src/env'

function App() {
  const [helloWorld, setHelloWorld] = useState<string>('')

  useEffect(() => {
    fetch(BACKEND_URL)
      .then((response) => response.json())
      .then((data) => setHelloWorld(data.message))
  }, [])

  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.tsx</code> and save to reload. Moshi Moshi is this working?: {helloWorld}
    //     </p>
    //     <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
    //       Learn React
    //     </a>
    //   </header>
    //   <KingdomMap kingdomId={1}></KingdomMap>
    // </div>
    // <div
    //   style={{
    //     minHeight: '100vh',
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     background: '#eaeaea', // csak hogy lásd a középre igazítást
    //   }}
    // >
    //   <Topdecks kingdominoId={2} />
    //   <KingdomMap kingdomId={1} />
    // </div>
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/games/kingdomino/:kingdominoId" element={<Kingdomino />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
