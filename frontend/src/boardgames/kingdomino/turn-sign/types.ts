import { KDPlayer } from '../types'

export type Turn = {
  player: KDPlayer
  action: 'place' | 'choose'
  drawnDomino?: {
    value: number
    drawnDominoId: number
    color: string
  }
}

export {}
