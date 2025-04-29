import './App.css'
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Kingdomino from './boardgames/kingdomino/kingdomino'
import { BACKEND_URL } from './types'
import { ToastProvider } from './toast-context'

function App() {
  const [helloWorld, setHelloWorld] = useState<string>('')

  useEffect(() => {
    fetch(BACKEND_URL)
      .then((response) => response.json())
      .then((data) => setHelloWorld(data.message))
  }, [])

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/games/kingdomino/:kingdominoId" element={<Kingdomino />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
