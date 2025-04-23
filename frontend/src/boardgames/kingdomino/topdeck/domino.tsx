import React from 'react'
import { BASE_SIZE } from '../utils'
import { Topdeck } from '../types'

type DominoProps = {
  domino: Topdeck
}

export const Domino: React.FC<DominoProps> = ({ domino }) => {
  const handleClick = async () => {
    if (domino.color) return // ha van color, ne csináljon semmit
    try {
      await fetch('http://localhost:3001/api/kingdomino/domino/choose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drawnDominoId: domino.id, playerId: 1 }),
      })
      // Itt lehet state frissítés, ha kell
    } catch (e) {
      // Hibakezelés, ha kell
      console.error(e)
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: 2 * BASE_SIZE,
        height: BASE_SIZE,
        display: 'inline-block',
        pointerEvents: domino.color ? 'none' : 'auto',
      }}
      onClick={handleClick}
      aria-disabled={!!domino.color}
    >
      <img
        key={domino.value}
        src={`boardgames/kingdomino/tiles/${domino.value}.png`}
        alt={`Domino ${domino.value}`}
        style={{
          width: 2 * BASE_SIZE,
          height: BASE_SIZE,
          pointerEvents: 'none',
          display: 'block',
        }}
      />
      {domino.color && (
        <img
          src={`boardgames/kingdomino/kings/${domino.color}.png`}
          alt="Center"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: BASE_SIZE / 2,
            height: BASE_SIZE / 2,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
