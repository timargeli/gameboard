import React from 'react'
import { translateColor } from '../utils'
import { Turn } from './types'
import { GameStateString } from '../types'
import { DefaultColors } from '../../../types'
import { useAuth } from '../../../auth-context'

type TurnSignProps = {
  baseSize: number
  turn: Turn | null
  state: GameStateString
}

export const TurnSign: React.FC<TurnSignProps> = ({ baseSize, turn, state }) => {
  const { userId } = useAuth()

  const getTurnString = (state: GameStateString, turn: Turn) => {
    if (state === 'ended') return 'A játéknak vége'
    if (userId === turn.player.user) return turn.action === 'choose' ? 'Te választasz' : 'Te raksz'
    return `${turn.player.name} ${turn.action === 'choose' ? 'választ' : 'rak'}`
  }

  if (!turn) return <div style={{ width: baseSize * 2, height: baseSize / 2 }} />

  return (
    <div
      style={{
        width: baseSize * 2.5,
        height: baseSize * 0.7,
        borderRadius: baseSize * 0.2,
        background: `${state === 'ended' ? DefaultColors.BROWN : translateColor(turn.player.color)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        border: `4px solid white`,
        margin: '16px auto',
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 700,
        fontSize: baseSize / 4,
        color: '#fff',
        letterSpacing: 1,
        transition: 'box-shadow 0.3s',
        position: 'relative',
        animation: 'pop 0.5s',
        whiteSpace: 'nowrap',
        padding: `0 ${baseSize / 3}px`,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: baseSize / 5, opacity: 0.9 }}>{getTurnString(state, turn)}</span>
      </span>
    </div>
  )
}
