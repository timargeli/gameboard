import React from 'react'
import { TopdeckColumn } from './topdeckColumn'
import { Topdeck } from './types'
import { Turn } from '../turn-sign/types'

type TopdecksProps = {
  turn: Turn | null
  topdecks: Topdeck[][]
  chooseDomino: (drawnDominoId: number) => void
}

export const Topdecks: React.FC<TopdecksProps> = ({ chooseDomino, turn, topdecks }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        border: '2px solid #333',
        padding: '8px',
      }}
    >
      {topdecks?.map((td, i) => (
        <TopdeckColumn key={i} dominos={td} turn={turn} chooseDomino={chooseDomino} />
      ))}
    </div>
  )
}
