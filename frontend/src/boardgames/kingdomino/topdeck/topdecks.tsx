import React, { useEffect, useState } from 'react'
import { TopdeckColumn } from './topdeckColumn'
import { useParams } from 'react-router-dom'
import { BACKEND_URL } from '../../../types'
import { Topdeck } from './types'
import { Turn } from '../turn-sign/types'

type TopdecksProps = {
  playerId: number | null
  turn: Turn | null
  setTurn: React.Dispatch<React.SetStateAction<Turn | null>>
}

export const Topdecks: React.FC<TopdecksProps> = ({ turn, setTurn, playerId }) => {
  const [topdecks, setTopdecks] = useState<Topdeck[][]>([[]])
  const { kingdominoId } = useParams<{ kingdominoId: string }>()

  useEffect(() => {
    fetch(`${BACKEND_URL}api/kingdomino/kingdomino/get-topdeck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ kingdominoId }),
    })
      .then((response) => response.json())
      .then((data) => setTopdecks(data.topdecks))
  }, [kingdominoId])

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
        <TopdeckColumn key={i} dominos={td} turn={turn} setTurn={setTurn} playerId={playerId} />
      ))}
    </div>
  )
}
