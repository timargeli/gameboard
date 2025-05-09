// FROM BACKEND

import { Topdeck } from './topdeck/types'
import { Turn } from './turn-sign/types'

export const colors = ['blue', 'green', 'yellow', 'pink']

export enum CellType {
  wheat = 'wheat',
  forest = 'forest',
  lake = 'lake',
  land = 'land',
  swamp = 'swamp',
  mine = 'mine',
  castle = 'castle',
}

export type Cell = {
  type: CellType
  crowns: number
  i: number
  j: number
} | null

// FROM SHARED

export type PlayerData = {
  id: number
  points: number
  color: string
  name: string
}

export type GameState = {
  gameState: GameStateString
  turn: Turn
  topdecks: Topdeck[][]
  results?: PlayerData[]
}

export type GameStateString = 'waiting' | 'in_game' | 'ended'
export type GameName = 'kingdomino' | 'some_other_game'

export type User = {
  id: number
  name: string
  password: string
  language?: string | null
}

export type Lobby = {
  id: number
  state: GameStateString
  game_name: GameName
  game?: number | Game | null
  game_options?: number | GameOptions | null
  players: number[]
  min_players: number
  max_players: number
  date_created: string
}

export type Game = {
  id: number
  game_name: GameName
  boardgame: number | Boardgame
  players: number[] | User[]
  chats: number[] | Chat[]
  date_created: string
}

export type GameOptions = {
  id: number
  game_name: string
  kingdomino_options?: number | KingdominoOptions | null
}

export type Chat = {
  id: number
  chat_type: 'all_chat' | 'team_chat'
  messages: number[] | Message[]
  players: number[] | User[]
}

export type Message = {
  id: number
  text: string
  player_sent?: number | User | null
  date_created: string
}

export type Boardgame = {
  id: number
  game_name: string
  kingdomino?: number | Kingdomino | null
}

// BOARDGAME BLOCK START
export type Kingdomino = {
  id: number
  deck: number[] | KDDomino[]
  drawn_dominos: number[] | KDKingdominoDomino[]
  players: number[] | KDPlayer[]
  options: number | KingdominoOptions
}

export type KingdominoOptions = {
  id: number
  big_kingdom_enabled: boolean
  complete_bonus: boolean
  middle_bonus: boolean
}

export type KDDomino = {
  id: number
  value: number
  img?: string | null
  left_cell: number | KDCell
  right_cell: number | KDCell
}

export type KDCell = {
  id: number
  type: string
  crowns: number
}

export type KDPlayer = {
  id: number
  user: number | User
  kingdom: number | KDKingdom
  color: string
  points?: number | null
}

export type KDKingdom = {
  id: number
  player: number | KDPlayer
  placed_dominos: number[] | KDKingdomDomino[]
}

export type KDKingdominoDomino = {
  id: number
  kingdomino_id: number | Kingdomino
  domino_id: number | KDDomino
  chosen_by_player?: number | KDPlayer | null
  built: boolean
}

export type KDKingdomDomino = {
  id: number
  kingdom_id: number | KDKingdom
  domino_id: number | KDDomino
  x: number
  y: number
  rot: number
}
// BOARDGAME BLOCK END
