import React, { useEffect, useRef, useState } from 'react'
import { LobbyItem } from '../components/lobbyItem'
import { BACKEND_URL, LobbyItem as Lobby } from '../types'
import io, { Socket } from 'socket.io-client'
import { useToast } from '../toast-context'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/button'
import { useAuth } from '../auth-context'

const SOCKET_URL = BACKEND_URL + 'lobbies'

export const Lobbies: React.FC = () => {
  const [lobbies, setLobbies] = useState<Lobby[]>([])
  const socketRef = useRef<typeof Socket | null>(null)

  const { userId, logout } = useAuth()

  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const socket = io(SOCKET_URL)
    socketRef.current = socket

    // Csatlakozás a lobbikhoz
    socket.emit('join-lobbies', {})

    // Lobbik fogadása
    socket.on('lobbies', (lobbies: Lobby[]) => {
      setLobbies(lobbies)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const handleJoin = (id: number) => {
    // Ha már eleve bennevagyunk, nem join, csak átirányítás
    const lobby = lobbies.find((l) => (l.id = id))
    if (lobby?.players.includes(userId || -1)) {
      socketRef.current?.emit('join-lobby', { lobbyId: id })
      navigate(`${id}`)
    } else {
      fetch(`${BACKEND_URL}api/lobby/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          lobbyId: id,
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
        // socket bűvészkedéseket ide
        .then(() => socketRef.current?.emit('join-lobby', { lobbyId: id }))
        .then(() => navigate(`${id}`))
        .catch((error) => {
          showToast(error.message || 'Ismeretlen hiba történt!', 'error')
        })
    }
  }

  // TODO refreshelje a lobbiest (ne endpoint csinálja a törlést pl)
  const handleDelete = (id: number) => {
    fetch(`${BACKEND_URL}api/lobby/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lobbyId: id,
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
      .catch((error) => {
        showToast(error.message || 'Ismeretlen hiba történt!', 'error')
      })
  }

  return (
    <div
      style={{
        margin: '48px auto',
        padding: '32px 0',
        background: '#a67c52',
        borderRadius: 18,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        border: '4px solid white',
        minWidth: 480,
        maxWidth: 520,
        textAlign: 'center',
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 700,
        fontSize: 22,
        color: '#333',
        letterSpacing: 1,
        position: 'relative',
        animation: 'pop 0.7s',
        height: 600,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 18, color: '#ffd700', letterSpacing: 2 }}>
        Elérhető Lobbik
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {lobbies.map((lobby) => (
          <LobbyItem key={lobby.id} {...lobby} handleJoin={handleJoin} handleDelete={handleDelete} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 18 }}>
        <Button onClick={() => navigate('/lobbies/+')}>Lobbi létrehozása</Button>
        <Button onClick={logout}>Kijelentkezés</Button>
      </div>
    </div>
  )
}
