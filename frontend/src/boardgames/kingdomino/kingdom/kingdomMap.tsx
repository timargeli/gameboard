import React, { useState } from 'react'
import { BACKEND_URL } from '../../../types'
import { DominoToPlace, KingdominoMap } from './types'
import { Turn } from '../turn-sign/types'
import { useToast } from '../../../toast-context'
import { useAuth } from '../../../auth-context'

type KingdomMapProps = {
  map: KingdominoMap
  setMap: React.Dispatch<React.SetStateAction<KingdominoMap>>
  dominoToPlace: DominoToPlace | null
  setDominoToPlace: React.Dispatch<React.SetStateAction<DominoToPlace | null>>
  baseSize: number
  turn?: Turn | null
  placeDomino: (/*x: number, y: number, rot: number, inTrash: boolean, drawnDominoId: number*/) => void
}

export const KingdomMap: React.FC<KingdomMapProps> = ({
  map,
  setMap,
  dominoToPlace,
  setDominoToPlace,
  baseSize,
  turn,
  placeDomino,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null)

  const { width, height, minX, minY } = map.dimensions

  const { showToast } = useToast()
  const { userId } = useAuth()

  // Növeljük a gridet minden irányban kettővel, ha még nem érte el a maxot
  const gridWidth = map.sideSize === width ? width : width + 4
  const gridHeight = map.sideSize === height ? height : height + 4

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
    if (!dominoToPlace) return
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
        userId,
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

  const maxGrid = Math.max(gridWidth, gridHeight)
  const scale = maxGrid > 5 ? 5 / maxGrid : 1 // pl. 10 cellánál nem skáláz, felette arányosan csökkent
  const scaledBaseSize = Math.round(baseSize * scale)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridWidth}, ${scaledBaseSize}px)`,
        gridTemplateRows: `repeat(${gridHeight}, ${scaledBaseSize}px)`,
        gap: '0px',
        position: 'relative',
        width: scaledBaseSize * gridWidth,
        height: scaledBaseSize * gridHeight,
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
              width: scaledBaseSize,
              height: scaledBaseSize,
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              background: '#fafafa',
              cursor: 'pointer',
              overflow: 'hidden',
              overscrollBehavior: 'contain',
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
            left: (hoveredCell.x - startX) * scaledBaseSize,
            top: (hoveredCell.y - startY) * scaledBaseSize,
            width: 2 * scaledBaseSize,
            height: scaledBaseSize,
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
            left: (domino.x - startX) * scaledBaseSize,
            top: (domino.y - startY) * scaledBaseSize,
            width: 2 * scaledBaseSize,
            height: scaledBaseSize,
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
            left: -startX * scaledBaseSize,
            top: -startY * scaledBaseSize,
            width: scaledBaseSize,
            height: scaledBaseSize,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
