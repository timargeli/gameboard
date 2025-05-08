import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getStateString } from '../components/lobbyItem'
import { BACKEND_URL, DefaultColors, LobbyItem } from '../types'
import { Button } from '../components/button'
import io, { Socket } from 'socket.io-client'
import { useToast } from '../toast-context'
import { GameoptionsTable } from '../components/gameoptionsTable'
import { useAuth } from '../auth-context'

const SOCKET_URL = BACKEND_URL + 'lobbies'

export const Lobby: React.FC = () => {
  const [lobby, setLobby] = useState<LobbyItem | null>(null)
  const socketRef = useRef<typeof Socket | null>(null)
  const navigate = useNavigate()
  const { lobbyId } = useParams()
  const { showToast } = useToast()

  const { userId } = useAuth()

  useEffect(() => {
    if (!lobbyId) return
    const socket = io(SOCKET_URL)
    socketRef.current = socket

    socket.emit('join-lobby', { lobbyId })

    socket.on('lobby', (lobby: LobbyItem) => {
      setLobby(lobby)
    })

    return () => {
      socket.disconnect()
    }
  }, [lobbyId])

  useEffect(() => {
    if (['ended', 'in_game'].includes(lobby?.state || '')) {
      navigate(`/games/${lobby?.game_name}/${lobby?.boardgame}`)
    }
  }, [lobby])

  const handleGameStart = async () => {
    fetch(`${BACKEND_URL}api/lobby/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lobbyId,
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
      .then((data) => setLobby(data.lobby))
      .catch((error) => {
        showToast(error.message || 'Ismeretlen hiba történt!', 'error')
      })
  }

  console.log('Lobby', lobby)

  const handleLeaveLobby = () => {
    socketRef.current?.emit('leave-lobby', { lobbyId, userId })
  }

  const playerCountText = `Játékosok száma: ${
    lobby?.min_players === lobby?.max_players
      ? lobby?.min_players
      : `${lobby?.min_players} - ${lobby?.max_players}`
  }`

  const incorrectPlayerCnt =
    !!lobby?.players.length &&
    (lobby.players.length < lobby.min_players || lobby.players.length > lobby.max_players)

  if (!lobbyId || !lobby || !lobby.game_name || !lobby.game_options || !lobby.players || !lobby.state)
    return <div>Loading...</div>

  return (
    <div
      style={{
        margin: '48px auto',
        padding: '32px 0',
        background: DefaultColors.BROWN,
        borderRadius: 18,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        border: '4px solid white',
        minWidth: 450,
        maxWidth: 600,
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
      {/* game name és státusz */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 32px',
          marginBottom: 28,
        }}
      >
        <span style={{ fontSize: 32, fontWeight: 700, color: DefaultColors.YELLOW, letterSpacing: 2 }}>
          {lobby.game_name}
        </span>
        <span style={{ fontSize: 18, color: 'white' }}>{getStateString(lobby.state)}</span>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: '0 32px',
        }}
      >
        {/* Játékos szám */}
        <div
          style={{
            fontSize: 18,
            color: '#fff',
            marginBottom: 18,
            whiteSpace: 'pre-line',
            textAlign: 'left',
          }}
        >
          {playerCountText}
        </div>

        {/* Játékosok felirat */}
        <div
          style={{
            fontSize: 14,
            color: '#fff',
            fontWeight: 600,
            marginBottom: 6,
            textAlign: 'left',
            letterSpacing: 1,
          }}
        >
          Játékosok:
        </div>

        {/* Játékos nevek */}
        <div
          style={{
            fontSize: 18,
            color: '#333',
            background: DefaultColors.YELLOW_GREEN,
            borderRadius: 10,
            padding: '10px 16px',
            margin: '0 0 20px 0',
            border: '2px solid #fff',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            minHeight: 40,
            textAlign: 'left',
            lineHeight: 1.7,
            letterSpacing: 0.5,
          }}
        >
          {lobby.player_names}
        </div>
        <GameoptionsTable lobby={lobby} />
      </div>
      {/* Gombok legalul */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          padding: '0 32px',
        }}
      >
        <Button onClick={handleGameStart} disabled={incorrectPlayerCnt || lobby.state !== 'waiting'}>
          Játék indítása
        </Button>
        <Button onClick={() => navigate('/lobbies')}>Vissza</Button>
        <Button onClick={handleLeaveLobby} variant="delete">
          Kilépés
        </Button>
      </div>
    </div>
  )
}
