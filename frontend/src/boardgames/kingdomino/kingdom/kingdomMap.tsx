import React, { useEffect, useState } from 'react'
import { BASE_SIZE } from '../utils'
import { BACKEND_URL } from '../../../types'
import { useParams } from 'react-router-dom'
import { DominoToPlace, KingdominoMap } from './types'
import { Turn } from '../turn-sign/types'
import { useToast } from '../../../toast-context'

type KingdomMapProps = {
  turn?: Turn | null
  playerId?: number | null // TEMP
}

export const KingdomMap: React.FC<KingdomMapProps> = ({ turn, playerId }) => {
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

  const [map, setMap] = useState<KingdominoMap>(initialMap)
  const [dominoToPlace, setDominoToPlace] = useState<DominoToPlace | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)
  const { kingdominoId } = useParams<{ kingdominoId: string }>()

  const { width, height, minX, minY } = map.dimensions

  const { showToast } = useToast()

  // TODO szépség: maxnál ne lehessen nagyobb
  // Növeljük a gridet minden irányban eggyel, balra kettővel
  const gridWidth = width + 4
  const gridHeight = height + 4

  // A grid bal felső sarka
  const startX = minX - 2
  const startY = minY - 2

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

  // Dominó forgatása
  const handleRotateDomino = (delta: number) => {
    if (!dominoToPlace) return
    setDominoToPlace({
      ...dominoToPlace,
      rot: (dominoToPlace.rot + delta + 4) % 4,
    })
  }

  const handleCellClick = (x: number, y: number) => {
    fetch(`${BACKEND_URL}api/kingdomino/domino/place`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        x,
        y,
        rot: dominoToPlace?.rot,
        drawnDominoId: dominoToPlace?.drawnDominoId,
        playerId: turn?.player?.id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || 'Valami hiba történt!')
          })
        }
        return response.json()
      })
      .then((data) => data.map && setMap(data.map))
      .catch((error) => {
        showToast(error.message || 'Ismeretlen hiba történt!', 'error')
      })
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridWidth}, ${BASE_SIZE}px)`,
        gridTemplateRows: `repeat(${gridHeight}, ${BASE_SIZE}px)`,
        gap: '0px',
        position: 'relative',
        width: BASE_SIZE * gridWidth,
        height: BASE_SIZE * gridHeight,
        border: '2px solid #333',
      }}
    >
      {/* Grid cellák */}
      {[...Array(gridWidth * gridHeight)].map((_, idx) => {
        const x = startX + (idx % gridWidth)
        const y = startY + Math.floor(idx / gridWidth)
        return (
          <div
            key={`${x},${y}`}
            style={{
              width: BASE_SIZE,
              height: BASE_SIZE,
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              background: '#fafafa',
              cursor: 'pointer',
            }}
            onClick={() => handleCellClick(x, y)}
            onMouseEnter={() => setHoveredCell({ x, y })}
            onMouseLeave={() => setHoveredCell(null)}
            onWheel={(e) => {
              if (!dominoToPlace) return
              //e.preventDefault() // TODO ezt megcsinálni jól
              handleRotateDomino(e.deltaY > 0 ? -1 : 1)
            }}
          />
        )
      })}
      {/* Lerakandó dominó */}
      {dominoToPlace && hoveredCell && (
        <img
          src={`/boardgames/kingdomino/tiles/${dominoToPlace.value}.png`}
          alt={`Domino ${dominoToPlace.value}`}
          style={{
            position: 'absolute',
            left: (hoveredCell.x - startX) * BASE_SIZE,
            top: (hoveredCell.y - startY) * BASE_SIZE,
            width: 2 * BASE_SIZE,
            height: BASE_SIZE,
            opacity: 0.5,
            pointerEvents: 'none',
            transform: `rotate(${-dominoToPlace.rot * 90}deg)`,
            transformOrigin: '25% 50%',
            zIndex: 10,
          }}
        />
      )}

      {/* Dominos */}
      {map.dominos.map((domino) => (
        <img
          key={domino.value}
          src={`/boardgames/kingdomino/tiles/${domino.value}.png`}
          alt={`Domino ${domino.value}`}
          style={{
            position: 'absolute',
            left: (domino.x - startX) * BASE_SIZE,
            top: (domino.y - startY) * BASE_SIZE,
            width: 2 * BASE_SIZE,
            height: BASE_SIZE,
            transform: `rotate(${-domino.rot * 90}deg)`,
            transformOrigin: '25% 50%',
            pointerEvents: 'none',
          }}
        />
      ))}
      {/* Castle */}
      {map.color && (
        <img
          key={`${map.color}-castle`}
          src={`/boardgames/kingdomino/castles/${map.color}.png`}
          alt={`${map.color} castle`}
          style={{
            position: 'absolute',
            left: -startX * BASE_SIZE,
            top: -startY * BASE_SIZE,
            width: BASE_SIZE,
            height: BASE_SIZE,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
