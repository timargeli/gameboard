import React, { useEffect, useState } from 'react'
import { KingdominoMap } from './types'

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
  const baseSize = 128

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

  console.log(map)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, ${baseSize}px)`,
        gridTemplateRows: `repeat(${height}, ${baseSize}px)`,
        gap: '0px',
        position: 'relative',
        width: baseSize * width,
        height: baseSize * height,
        border: '2px solid #333',
      }}
    >
      {/* Grid */}
      {[...Array(width * height)].map((_, idx) => (
        <div
          key={idx}
          style={{
            width: baseSize,
            height: baseSize,
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
            left: (domino.x - minX) * baseSize,
            top: (domino.y - minY) * baseSize,
            width: 2 * baseSize,
            height: baseSize,
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
            left: -minX * baseSize,
            top: -minY * baseSize,
            width: baseSize,
            height: baseSize,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
