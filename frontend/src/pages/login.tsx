import React, { useState } from 'react'
import { DefaultColors } from '../types'
import { Button } from '../components/button'

export const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

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
        <Button>Bejelentkezés / Regisztráció</Button>
      </div>
    </div>
  )
}
