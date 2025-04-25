import React, { useEffect, useState } from 'react'
import { BASE_SIZE } from '../utils'
import { useParams } from 'react-router-dom'
import { BACKEND_URL } from '../../../types'
import { TurnWithPlayer } from './types'

const PLAYER_COLORS = [
  '#4F8A8B', // Player 1
  '#FBD46D', // Player 2
  '#F76B8A', // Player 3
  '#A3D2CA', // Player 4
]

export const TurnSign: React.FC = () => {
  const [turn, setTurn] = useState<TurnWithPlayer | null>(null)
  const { kingdominoId } = useParams<{ kingdominoId: string }>()

  useEffect(() => {
    fetch(`${BACKEND_URL}api/kingdomino/kingdomino/get-turn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ kingdominoId }),
    })
      .then((response) => response.json())
      .then((data) => setTurn(data.turn))
  }, [kingdominoId])

  if (!turn) return <div style={{ width: BASE_SIZE * 2, height: BASE_SIZE / 2 }} />

  return (
    <div
      style={{
        width: BASE_SIZE * 2.5, // szélesebb téglalap
        height: BASE_SIZE * 0.7, // alacsonyabb
        borderRadius: BASE_SIZE * 0.2, // lekerekített sarkok
        background: `${turn.player.color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        border: `4px solid white`,
        margin: '16px auto',
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 700,
        fontSize: BASE_SIZE / 4,
        color: '#fff',
        letterSpacing: 1,
        transition: 'box-shadow 0.3s',
        position: 'relative',
        animation: 'pop 0.5s',
        whiteSpace: 'nowrap', // egy sorba kényszeríti a szöveget
        padding: `0 ${BASE_SIZE / 3}px`,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{ fontSize: BASE_SIZE / 5, opacity: 0.9 }}
        >{`It's player ${turn.player.id}'s turn to ${turn.action}`}</span>
      </span>
    </div>
  )
}
