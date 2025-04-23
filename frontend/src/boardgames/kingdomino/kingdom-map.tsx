import React, { useEffect, useState } from 'react'
import { KingdominoMap } from './types'
import { BASE_SIZE } from './utils'

type KingdomMapProps = {
  kingdomId: number
}

export const KingdomMap: React.FC<KingdomMapProps> = ({ kingdomId }) => {
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
  const { width, height, minX, minY } = map.dimensions

  useEffect(() => {
    fetch('http://localhost:3001/api/kingdomino/kingdom/get-map', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ kingdomId }),
    })
      .then((response) => response.json())
      .then((data) => setMap(data.map))
  }, [kingdomId])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, ${BASE_SIZE}px)`,
        gridTemplateRows: `repeat(${height}, ${BASE_SIZE}px)`,
        gap: '0px',
        position: 'relative',
        width: BASE_SIZE * width,
        height: BASE_SIZE * height,
        border: '2px solid #333',
      }}
    >
      {/* Grid */}
      {[...Array(width * height)].map((_, idx) => (
        <div
          key={idx}
          style={{
            width: BASE_SIZE,
            height: BASE_SIZE,
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            background: '#fafafa',
          }}
        />
      ))}

      {/* Dominos */}
      {map.dominos.map((domino) => (
        <img
          key={domino.value}
          src={`boardgames/kingdomino/tiles/${domino.value}.png`}
          alt={`Domino ${domino.value}`}
          style={{
            position: 'absolute',
            left: (domino.x - minX) * BASE_SIZE,
            top: (domino.y - minY) * BASE_SIZE,
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
          src={`boardgames/kingdomino/castles/${map.color}.png`}
          alt={`${map.color} castle`}
          style={{
            position: 'absolute',
            left: -minX * BASE_SIZE,
            top: -minY * BASE_SIZE,
            width: BASE_SIZE,
            height: BASE_SIZE,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
