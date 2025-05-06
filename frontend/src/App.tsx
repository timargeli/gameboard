import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Kingdomino from './boardgames/kingdomino/kingdomino'
import { ToastProvider } from './toast-context'
import { Login } from './pages/login'
import { Lobbies } from './pages/lobbies'
import { Lobby } from './pages/lobby'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/lobbies" element={<Lobbies />} />
          <Route path="/lobbies/:lobbyId" element={<Lobby />} />
          <Route path="/games/kingdomino/:kingdominoId" element={<Kingdomino />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
