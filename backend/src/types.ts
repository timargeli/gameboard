import { Request, Response } from 'express'
import { Lobby } from './boardgames/kingdomino/types'

export enum GameStateString {
  waiting = 'waiting',
  inGame = 'in_game',
  ended = 'ended',
}
export type GameName = 'kingdomino' | 'some_other_game'

export type EndpointType = 'post' | 'get'

export type Endpoint = {
  endpointType: EndpointType
  path: string
  handler: (req: Request, res: Response) => Promise<any>
}

export type OptionDescriptor = {
  optionName: string
  optionDisplayName: string
  optionType: string
}

export type LobbyItem = Lobby & {
  player_names: string
  boardgame: number | null
}
