import React from 'react'
import { BASE_SIZE } from '../utils'
import { Domino } from './domino'
import { Topdeck } from './types'
import { Turn } from '../turn-sign/types'

type TopdeckColumnProps = {
  dominos: Topdeck[]
  turn: Turn | null
  playerId: number | null
}

export const TopdeckColumn: React.FC<TopdeckColumnProps> = ({ dominos, turn, playerId }) => {
  console.log('dominos', dominos)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${dominos.length}, ${BASE_SIZE}px)`,
        gap: '8px',
        width: 2 * BASE_SIZE,
        border: '2px solid #333',
        background: '#fff',
        padding: '4px',
      }}
    >
      {dominos
        .sort((d1, d2) => d1.value - d2.value)
        .map((domino) => (
          <Domino key={domino.value} domino={domino} turn={turn} playerId={playerId} />
        ))}
    </div>
  )
}
