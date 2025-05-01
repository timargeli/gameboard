import React from 'react'
import { BASE_SIZE } from '../utils'
import { DominoToPlace } from '../kingdom/types'
import { BACKEND_URL } from '../../../types'
import { useToast } from '../../../toast-context'
import { Turn } from '../turn-sign/types'

type TrashProps = {
  dominoToPlace: DominoToPlace | null
  turn: Turn | null
  placeDomino: () => void
}

export const Trash: React.FC<TrashProps> = ({ placeDomino, dominoToPlace, turn }) => {
  const { showToast } = useToast()

  const handleClick = () => {
    if (!dominoToPlace) return
    fetch(`${BACKEND_URL}api/kingdomino/domino/place`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inTrash: true,
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
      .then(() => placeDomino())
      .catch((error) => {
        showToast(error.message || 'Ismeretlen hiba történt!', 'error')
      })
  }
  return (
    <div
      style={{
        width: BASE_SIZE,
        height: BASE_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#eee',
        borderRadius: BASE_SIZE * 0.1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        border: '2px solid #888',
        cursor: 'pointer',
        userSelect: 'none',
        margin: '0 auto',
      }}
      title="Trash"
      onClick={handleClick}
    >
      <img
        src="/boardgames/kingdomino/bin.png"
        alt="Bin"
        style={{
          width: BASE_SIZE * 0.8,
          height: BASE_SIZE * 0.8,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  )
}
