import React from 'react'
import { LobbyItem } from '../types'
import { KingdominoOptionsTable } from '../boardgames/kingdomino/options/kingdominoOptionsTable'

type GameoptionsTableProps = {
  lobby: LobbyItem
}

export const GameoptionsTable: React.FC<GameoptionsTableProps> = ({ lobby }) => {
  switch (lobby.game_name) {
    case 'kingdomino':
      return <KingdominoOptionsTable lobbyId={lobby.id} />
    default:
      return <></>
  }
}
