import React from 'react'
import { Topdeck } from './types'
import { Turn } from '../turn-sign/types'
import { useToast } from '../../../toast-context'

type DominoProps = {
  domino: Topdeck
  turn: Turn | null
  chooseDomino: (drawnDominoId: number) => void
  baseSize: number
}

export const Domino: React.FC<DominoProps> = ({ domino, turn, chooseDomino, baseSize }) => {
  const { showToast } = useToast()

  const handleClick = async () => {
    if (domino.color) {
      showToast('Ezt a dominót már választotta valaki', 'error')
      return
    }
    chooseDomino(domino.id)
  }

  return (
    <div
      style={{
        position: 'relative',
        width: 2 * baseSize,
        height: baseSize,
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
          width: 2 * baseSize,
          height: baseSize,
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
            width: baseSize / 2,
            height: baseSize / 2,
            opacity: domino.value === turn?.drawnDomino?.value ? 0.5 : 1,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}
