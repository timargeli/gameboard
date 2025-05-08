import React, { useEffect } from 'react'
import { DefaultColors } from '../../../types'
import { kingdominoOptionLabels } from './labels'

type Options = {
  big_kingdom_enabled: boolean
  complete_bonus: boolean
  middle_bonus: boolean
}

type KingdominoOptionsProps = {
  boardgameOptions: Options
  setBoardgameOptions: React.Dispatch<React.SetStateAction<Options | null>>
}

export const KingdominoOptions: React.FC<KingdominoOptionsProps> = ({
  boardgameOptions,
  setBoardgameOptions,
}) => {
  useEffect(() => {
    if (!boardgameOptions) {
      setBoardgameOptions({
        big_kingdom_enabled: false,
        complete_bonus: false,
        middle_bonus: false,
      })
    }
  }, [boardgameOptions])

  const handleChange = (key: keyof Options) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoardgameOptions((prev) => ({
      ...prev!,
      [key]: e.target.checked,
    }))
  }

  return (
    <div
      style={{
        background: DefaultColors.YELLOW_GREEN,
        borderRadius: 12,
        padding: '18px 24px',
        border: '2px solid #fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontWeight: 600,
        fontSize: 18,
        color: '#333',
        marginBottom: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={boardgameOptions?.big_kingdom_enabled}
          onChange={handleChange('big_kingdom_enabled')}
          style={{
            width: 22,
            height: 22,
            accentColor: DefaultColors.YELLOW,
            borderRadius: 6,
            marginRight: 8,
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            cursor: 'pointer',
          }}
        />
        {kingdominoOptionLabels.find((l) => l.optionName === 'big_kingdom_enabled')?.optionDisplayName}
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={boardgameOptions?.complete_bonus}
          onChange={handleChange('complete_bonus')}
          style={{
            width: 22,
            height: 22,
            accentColor: DefaultColors.YELLOW,
            borderRadius: 6,
            marginRight: 8,
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            cursor: 'pointer',
          }}
        />
        {kingdominoOptionLabels.find((l) => l.optionName === 'complete_bonus')?.optionDisplayName}
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={boardgameOptions?.middle_bonus}
          onChange={handleChange('middle_bonus')}
          style={{
            width: 22,
            height: 22,
            accentColor: DefaultColors.YELLOW,
            borderRadius: 6,
            marginRight: 8,
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            cursor: 'pointer',
          }}
        />
        {kingdominoOptionLabels.find((l) => l.optionName === 'middle_bonus')?.optionDisplayName}
      </label>
    </div>
  )
}
