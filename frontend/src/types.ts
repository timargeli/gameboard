import { Lobby } from './boardgames/kingdomino/types'

export const BACKEND_URL = 'http://localhost:3001/'

export enum DefaultColors {
  BLUE = '#2563eb',
  GREEN = '#16a34a',
  YELLOW = '#facc15',
  PINK = '#e57373',
  BROWN = '#6d4c29',
  GOLD = '#ffd700',
  RED = '#e53935',
  YELLOW_GREEN = '#9acd32',
}

export type LobbyItem = Lobby & {
  player_names: string
  boardgame: number | null
}
