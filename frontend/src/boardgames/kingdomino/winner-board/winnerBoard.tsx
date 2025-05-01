import React from 'react'
import { BASE_SIZE } from '../utils'
import { PlayerData } from '../types'

type WinnerBoardProps = {
  winners: PlayerData[]
}

const scale = BASE_SIZE / 2

export const WinnerBoard: React.FC<WinnerBoardProps> = ({ winners }) => {
  if (!winners.length) return null

  return (
    <div
      style={{
        margin: '32px auto',
        padding: `${scale / 2}px ${scale}px`,
        background: 'linear-gradient(90deg, #ffe259 0%, #ffa751 100%)',
        borderRadius: scale * 0.3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        border: '4px solid white',
        minWidth: scale * 6,
        maxWidth: scale * 12,
        textAlign: 'center',
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 700,
        fontSize: scale / 3,
        color: '#333',
        letterSpacing: 1,
        position: 'relative',
        animation: 'pop 0.7s',
      }}
    >
      <div style={{ fontSize: scale / 2, marginBottom: 12, color: '#b8860b', letterSpacing: 2 }}>
        🏆Gratulálunk!🏆
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {winners.map((player) => (
          <div
            key={player.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              background: player.color,
              color: '#fff',
              borderRadius: scale * 0.2,
              padding: `8px ${scale / 2}px`,
              fontSize: scale / 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              border: '2px solid #fff',
            }}
          >
            <span style={{ fontWeight: 900 }}>{player.name}</span>
            <span style={{ fontSize: scale / 4, opacity: 0.85 }}>({player.points} pont)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
