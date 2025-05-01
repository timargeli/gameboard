import React, { useEffect, useState } from 'react'
import { BASE_SIZE } from '../utils'
import { BACKEND_URL } from '../../../types'
import { useParams } from 'react-router-dom'
import { DominoToPlace, KingdominoMap } from './types'
import { Turn } from '../turn-sign/types'
import { useToast } from '../../../toast-context'

type KingdomMapProps = {
  map: KingdominoMap
  setMap: React.Dispatch<React.SetStateAction<KingdominoMap>>
  dominoToPlace: DominoToPlace | null
  setDominoToPlace: React.Dispatch<React.SetStateAction<DominoToPlace | null>>
  turn?: Turn | null
  placeDomino: (/*x: number, y: number, rot: number, inTrash: boolean, drawnDominoId: number*/) => void
}

export const KingdomMap: React.FC<KingdomMapProps> = ({
  map,
  setMap,
  dominoToPlace,
  setDominoToPlace,
  turn,
  placeDomino,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)

  const { width, height, minX, minY } = map.dimensions

  const { showToast } = useToast()

  // TODO szépség: maxnál ne lehessen nagyobb
  // Növeljük a gridet minden irányban kettővel, ha még nem érte el a maxot
  const gridWidth = map.sideSize === width ? width : width + 4
  const gridHeight = map.sideSize === height ? height : height + 4

  console.log(width)
  console.log(height)
  console.log(map.dimensions)

  // A grid bal felső sarka
  const startX = map.sideSize === width ? minX : minX - 2
  const startY = map.sideSize === height ? minY : minY - 2

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
      .then(() => placeDomino())
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
