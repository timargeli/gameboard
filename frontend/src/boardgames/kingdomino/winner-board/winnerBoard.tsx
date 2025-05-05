import React from 'react'
import { PlayerData } from '../types'
import { translateColor } from '../utils'
import { DefaultColors } from '../../../types'

type WinnerBoardProps = {
  winners: PlayerData[]
  baseSize: number
}

export const WinnerBoard: React.FC<WinnerBoardProps> = ({ winners, baseSize }) => {
  if (!winners.length) return null

  const scale = baseSize / 2

  return (
    <div
      style={{
        margin: '32px auto',
        padding: `${scale / 2}px ${scale}px`,
        background: DefaultColors.BROWN,
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
      <div style={{ fontSize: scale / 2, marginBottom: 12, color: '#ffd700', letterSpacing: 2 }}>
        🏆Gratulálunk!🏆
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {winners.map((player) => (
          <div
            key={player.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              //gap: 16,
              background: translateColor(player.color),
              color: '#fff',
              borderRadius: scale * 0.2,
              padding: `8px ${scale / 2}px`,
              fontSize: scale / 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              border: '2px solid #fff',
            }}
          >
            <span style={{ fontWeight: 900 }}>{player.name}</span>
            <span style={{ fontSize: scale / 3 }}> {player.points} pont</span>
          </div>
        ))}
      </div>
    </div>
  )
}
