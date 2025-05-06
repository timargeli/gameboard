import React, { useEffect, useState } from 'react'
import { KingdominoOptions } from '../types'
import { BACKEND_URL, DefaultColors } from '../../../types'
import { useToast } from '../../../toast-context'
import { kingdominoOptionLabels } from './labels'

type KingdominoOptionsTableProps = {
  lobbyId: number
}

export const KingdominoOptionsTable: React.FC<KingdominoOptionsTableProps> = ({ lobbyId }) => {
  const [options, setOptions] = useState<KingdominoOptions | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetch(`${BACKEND_URL}api/game-options/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lobbyId }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || 'Valami hiba történt!')
          })
        }
        return response.json()
      })
      .then((data) => setOptions(data.options))
      .catch((error) => {
        showToast(error.message || 'Ismeretlen hiba történt!', 'error')
      })
  }, [lobbyId])

  if (!options) return <></>

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 14,
          color: '#fff',
          fontWeight: 600,
          marginBottom: 6,
          textAlign: 'left',
          letterSpacing: 1,
        }}
      >
        Kingdominó beállítások:
      </div>
      <div
        style={{
          background: DefaultColors.YELLOW_GREEN,
          borderRadius: 10,
          padding: '18px 18px',
          border: '2px solid #fff',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          minHeight: 40,
          textAlign: 'left',
          lineHeight: 1.7,
          letterSpacing: 0.5,
          color: '#333',
          fontFamily: 'Montserrat, Arial, sans-serif',
        }}
      >
        {kingdominoOptionLabels.map((opt) => {
          const enabled = !!options[opt.optionName as keyof KingdominoOptions]
          return (
            <div
              key={opt.optionName}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 6,
                fontSize: 15,
              }}
            >
              <span style={{ fontSize: 20, marginRight: 10 }}>{enabled ? '✅' : '❌'}</span>
              <span>{opt.optionDisplayName}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
