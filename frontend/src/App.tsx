import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Kingdomino from './boardgames/kingdomino/kingdomino'
import { ToastProvider } from './toast-context'
import { Login } from './pages/login'
import { Lobbies } from './pages/lobbies'
import { Lobby } from './pages/lobby'
import { CreateLobby } from './pages/createLobby'
import { AuthProvider, HomeRedirect, RequireAuth } from './auth-context'
import { Layout } from './layout'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/lobbies"
                element={
                  <RequireAuth>
                    <Lobbies />
                  </RequireAuth>
                }
              />
              <Route
                path="/lobbies/:lobbyId"
                element={
                  <RequireAuth>
                    <Lobby />
                  </RequireAuth>
                }
              />
              <Route
                path="/lobbies/+"
                element={
                  <RequireAuth>
                    <CreateLobby />
                  </RequireAuth>
                }
              />

              <Route
                path="/games/kingdomino/:kingdominoId"
                element={
                  <RequireAuth>
                    <Kingdomino />
                  </RequireAuth>
                }
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
