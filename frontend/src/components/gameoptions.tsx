import React from 'react'
import { LobbyItem } from '../types'
import { KingdominoOptionsTable } from '../boardgames/kingdomino/options/kingdominoOptionsTable'

type GameoptionsProps = {
  lobby: LobbyItem
}

export const Gameoptions: React.FC<GameoptionsProps> = ({ lobby }) => {
  switch (lobby.game_name) {
    case 'kingdomino':
      return <KingdominoOptionsTable lobbyId={lobby.id} />
    default:
      return <></>
  }
}
