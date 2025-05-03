import React from 'react'
import { Domino } from './domino'
import { Topdeck } from './types'
import { Turn } from '../turn-sign/types'

type TopdeckColumnProps = {
  dominos: Topdeck[]
  turn: Turn | null
  chooseDomino: (drawnDominoId: number) => void
  baseSize: number
}

export const TopdeckColumn: React.FC<TopdeckColumnProps> = ({ chooseDomino, dominos, turn, baseSize }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${dominos.length}, ${baseSize}px)`,
        gap: '8px',
        width: 2 * baseSize,
        border: '2px solid #333',
        background: '#fff',
        padding: '4px',
      }}
    >
      {dominos
        .sort((d1, d2) => d1.value - d2.value)
        .map((domino) => (
          <Domino
            key={domino.value}
            domino={domino}
            turn={turn}
            chooseDomino={chooseDomino}
            baseSize={baseSize}
          />
        ))}
    </div>
  )
}
