import React from 'react'
import { BASE_SIZE } from '../utils'
import { Topdeck } from './types'
import { Turn } from '../turn-sign/types'

type DominoProps = {
  domino: Topdeck
  turn: Turn | null
  chooseDomino: (drawnDominoId: number) => void
}

export const Domino: React.FC<DominoProps> = ({ domino, turn, chooseDomino }) => {
  const handleClick = async () => {
    if (domino.color) return // ha van color, ne csináljon semmit
    chooseDomino(domino.id)
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
        src={`/boardgames/kingdomino/tiles/${domino.value}.png`}
        alt={`Domino ${domino.value}`}
        style={{
          width: 2 * BASE_SIZE,
          height: BASE_SIZE,
          opacity: domino.value === turn?.drawnDomino?.value ? 0.5 : 1,
          pointerEvents: 'none',
          display: 'block',
        }}
      />
      {domino.color && (
        <img
          src={`/boardgames/kingdomino/kings/${domino.color}.png`}
          alt="Center"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: BASE_SIZE / 2,
            height: BASE_SIZE / 2,
            opacity: domino.value === turn?.drawnDomino?.value ? 0.5 : 1,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
