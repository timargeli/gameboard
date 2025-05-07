import React from 'react'
import { KingdominoOptions } from '../boardgames/kingdomino/options/kingdominoOptions'

type BoardgameOptionsProps = {
  gameName: string
  boardgameOptions: any
  setBoardgameOptions: React.Dispatch<React.SetStateAction<any | null>>
}

export const BoardgameOptions: React.FC<BoardgameOptionsProps> = ({
  gameName,
  boardgameOptions,
  setBoardgameOptions,
}) => {
  switch (gameName) {
    case 'kingdomino':
      return (
        <KingdominoOptions boardgameOptions={boardgameOptions} setBoardgameOptions={setBoardgameOptions} />
      )
    default:
      return <></>
  }
}
