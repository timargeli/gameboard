import React, { useEffect, useState } from 'react'
import { KingdomMap } from './kingdom/kingdomMap'
import { TurnSign } from './turn-sign/turnSign'
import { Topdecks } from './topdeck/topdecks'
import { useLocation, useParams } from 'react-router-dom'
import { BACKEND_URL } from '../../types'
import { Turn } from './turn-sign/types'
import { DominoToPlace, KingdominoMap } from './kingdom/types'

const initialMap: KingdominoMap = {
  map: null,
  dominos: [],
  points: 0,
  sideSize: 7,
  kingdominoOptions: null,
  color: '',
  dimensions: {
    width: 7,
    height: 7,
    minX: 0,
    minY: 0,
  },
}

const Kingdomino: React.FC = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const playerId = searchParams.get('playerId')
  const { kingdominoId } = useParams<{ kingdominoId: string }>()
  const [turn, setTurn] = useState<Turn | null>(null)
  const [map, setMap] = useState<KingdominoMap>(initialMap)
  const [dominoToPlace, setDominoToPlace] = useState<DominoToPlace | null>(null)

  // Turn lekérdezése
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
  }, [map, kingdominoId])

  // map lekérdezése
  useEffect(() => {
    fetch(`${BACKEND_URL}api/kingdomino/kingdom/get-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId, kingdominoId }),
    })
      .then((response) => response.json())
      .then((data) => setMap(data.map))
  }, [playerId, kingdominoId])

  // lerakandó dominó beállítása
  useEffect(() => {
    if (turn?.drawnDomino && map.color === turn.drawnDomino.color) {
      setDominoToPlace({ ...turn.drawnDomino, rot: 0 })
    } else {
      setDominoToPlace(null)
    }
  }, [map, turn]) // Itt a turnt kéne ujrahivni vagy vmi ilyesmi, hogy ne ragadjon be a lerakni való domino

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
        <KingdomMap
          map={map}
          setMap={setMap}
          dominoToPlace={dominoToPlace}
          setDominoToPlace={setDominoToPlace}
          turn={turn}
          playerId={Number(playerId)}
        />
        <Topdecks turn={turn} setTurn={setTurn} playerId={Number(playerId)} />
      </div>
    </div>
  )
}

export default Kingdomino
