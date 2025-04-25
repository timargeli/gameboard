import React from 'react'
import { KingdomMap } from './kingdom/kingdom-map'
import { TurnSign } from './turn-sign/turnSign'
import { Topdecks } from './topdeck/topdecks'
import { useLocation } from 'react-router-dom'

const Kingdomino: React.FC = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const kingdomId = searchParams.get('kingdomId')
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // TurnSign középre
        gap: 24, // távolság a sorok között
      }}
    >
      <TurnSign />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 32, // távolság a map és a decks között
        }}
      >
        <KingdomMap kingdomId={Number(kingdomId)} />
        <Topdecks />
      </div>
    </div>
  )
}

export default Kingdomino
