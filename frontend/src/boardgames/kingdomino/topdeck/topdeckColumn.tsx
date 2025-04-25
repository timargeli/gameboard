import React from 'react'
import { BASE_SIZE } from '../utils'
import { Domino } from './domino'
import { Topdeck } from './types'

type TopdeckColumnProps = {
  dominos: Topdeck[]
}

export const TopdeckColumn: React.FC<TopdeckColumnProps> = ({ dominos }) => {
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
      {dominos.map((domino) => (
        <Domino key={domino.value} domino={domino} />
      ))}
    </div>
  )
}
