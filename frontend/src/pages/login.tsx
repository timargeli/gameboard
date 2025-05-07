import React, { useState } from 'react'
import { BACKEND_URL, DefaultColors } from '../types'
import { Button } from '../components/button'
import { useAuth } from '../auth-context'
import { useToast } from '../toast-context'
import { useNavigate } from 'react-router-dom'

export const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const { showToast } = useToast()
  const { setUserId } = useAuth()

  const handleLogin = () => {
    fetch(`${BACKEND_URL}api/users/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: username,
        password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || 'Valami hiba történt!')
          })
        }
        return response.json()
      })
      .then((data) => data?.user?.id && setUserId(data.user.id))
      .then(() => navigate('/lobbies'))
      .catch((error) => {
        showToast(error.message || 'Ismeretlen hiba történt!', 'error')
      })
  }

  return (
    <div
      style={{
        margin: '48px auto',
        padding: '32px 48px',
        background: DefaultColors.BROWN,
        borderRadius: 18,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        border: '4px solid white',
        minWidth: 320,
        maxWidth: 480,
        textAlign: 'center',
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 700,
        fontSize: 22,
        color: '#333',
        letterSpacing: 1,
        position: 'relative',
        animation: 'pop 0.7s',
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 18, color: '#ffd700', letterSpacing: 2 }}>Gameboard</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <input
          type="text"
          placeholder="Felhasználónév"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '2px solid #fff',
            fontSize: 18,
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            outline: 'none',
          }}
        />
        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '2px solid #fff',
            fontSize: 18,
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            outline: 'none',
          }}
        />
        <Button onClick={handleLogin}>Bejelentkezés / Regisztráció</Button>
      </div>
    </div>
  )
}
