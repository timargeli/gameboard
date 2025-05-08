import { KDPlayer } from '../types'

export type Turn = {
  player: PlayerWithUser
  action: 'place' | 'choose'
  drawnDomino?: {
    value: number
    drawnDominoId: number
    color: string
  }
}

export type PlayerWithUser = KDPlayer & {
  name: string
}

export {}
