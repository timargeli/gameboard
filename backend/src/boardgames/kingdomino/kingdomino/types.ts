import { KdKingdom } from '../../../database/generated'
import { CellType, KDPlayer } from '../types'

export type BulkInsertKDKingdominoDomino = {
  kingdomino_id: number
  domino_id: number | null
  chosen_by_player: number | null
  parity: boolean
}

export type Topdeck = {
  value: number & { readonly __brand?: 'kd_domino_value' }
  parity: boolean
  color: string
  id: number & { readonly __brand?: 'kd_kingdomino_domino_id' }
}

export type PlacedDominoJoined = {
  // Domino
  img: string | null
  left_cell_crowns: number | null
  left_cell_type: string
  right_cell_crowns: number | null
  right_cell_type: string
  value: number & { readonly __brand?: 'kd_domino_value' }
  // KingdomDomino
  id: number & { readonly __brand?: 'kd_kingdom_domino_id' }
  kingdom_id: KdKingdom['id'] | null
  rot: number
  x: number
  y: number
}

export type CellData = {
  x: number
  y: number
  i: number
  j: number
  cell: {
    type: CellType
    crowns: number
    x: number
    y: number
  }
}

export type Territory = {
  type: CellType
  crowns: number
  cells: {
    i: number
    j: number
  }[]
}

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
