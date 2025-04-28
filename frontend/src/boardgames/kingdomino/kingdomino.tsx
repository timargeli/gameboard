import React, { useEffect, useState } from 'react'
import { KingdomMap } from './kingdom/kingdomMap'
import { TurnSign } from './turn-sign/turnSign'
import { Topdecks } from './topdeck/topdecks'
import { useLocation, useParams } from 'react-router-dom'
import { BACKEND_URL } from '../../types'
import { Turn } from './turn-sign/types'

const Kingdomino: React.FC = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const playerId = searchParams.get('playerId')
  const { kingdominoId } = useParams<{ kingdominoId: string }>()
  const [turn, setTurn] = useState<Turn | null>(null)

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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // TurnSign középre
        gap: 24, // távolság a sorok között
      }}
    >
      <TurnSign turn={turn} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 32, // távolság a map és a decks között
        }}
      >
        <KingdomMap turn={turn} playerId={Number(playerId)} />
        <Topdecks turn={turn} playerId={Number(playerId)} />
      </div>
    </div>
  )
}

export default Kingdomino
