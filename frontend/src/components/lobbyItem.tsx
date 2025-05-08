import React from 'react'
import { Button } from './button'
import { DefaultColors } from '../types'
import { useAuth } from '../auth-context'

type LobbyItemProps = {
  id: number
  game_name: string
  state: string
  players: number[]
  min_players: number
  max_players: number
  player_names: string
  date_created: string
  handleJoin: (id: number) => void
  handleDelete: (id: number) => void
}

export const getStateString = (state: string) => {
  switch (state) {
    case 'waiting':
      return 'Várakozás 🟢'
    case 'in_game':
      return 'Játékban 🟡'
    case 'ended':
      return 'Játék vége 🔴'
    default:
      return 'Hibás státusz ⚪️'
  }
}

export const LobbyItem: React.FC<LobbyItemProps> = ({
  id,
  game_name,
  state,
  players,
  player_names,
  min_players,
  max_players,
  date_created,
  handleJoin,
  handleDelete,
}) => {
  const dateString = new Date(date_created).toLocaleString('hu-HU')

  const { userId } = useAuth()

  return (
    <div
      style={{
        background: DefaultColors.YELLOW_GREEN,
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        border: '2px solid #fff',
        padding: '18px 24px',
        margin: '0 0 18px 0',
        minWidth: 320,
        maxWidth: 480,
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 600,
        color: '#333',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
      }}
    >
      {/* Game name and state */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{game_name}</span>
        <span style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{getStateString(state)}</span>
        </span>
      </div>
      {/* Players */}
      <div
        style={{
          fontSize: 16,
          color: '#555',
          margin: '4px 0',
          alignItems: 'normal',
          wordBreak: 'break-all',
          textAlign: 'left',
        }}
      >
        {player_names}
      </div>
      {/* Player cnt and date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#555' }}>
        <span>
          {players.length || 0} /{' '}
          {min_players === max_players ? min_players : `${min_players}-${max_players}`}
        </span>
        <span>{dateString}</span>
      </div>
      {/* Bottom row / Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <Button onClick={() => handleJoin(id)}>
          {players.includes(userId || -1) ? 'Belépés' : 'Csatlakozás'}
        </Button>
        <Button onClick={() => handleDelete(id)} variant="delete" disabled={state === 'in_game'}>
          Törlés
        </Button>
      </div>
    </div>
  )
}
