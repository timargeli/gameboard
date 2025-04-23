import React, { useEffect, useState } from 'react'
import { BASE_SIZE } from '../utils'
import { Topdeck } from '../types'
import { TopdeckColumn } from './topdeckColumn'

type TopdecksProps = {
  kingdominoId: number
}

export const Topdecks: React.FC<TopdecksProps> = ({ kingdominoId }) => {
  const [topdecks, setTopdecks] = useState<Topdeck[][]>([[]])

  useEffect(() => {
    fetch('http://localhost:3001/api/kingdomino/kingdomino/get-topdeck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ kingdominoId }),
    })
      .then((response) => response.json())
      .then((data) => setTopdecks(data.topdecks))
  }, [kingdominoId])

  console.log('topdecks', topdecks)

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
        <TopdeckColumn key={i} dominos={td} />
      ))}
    </div>
  )
}
