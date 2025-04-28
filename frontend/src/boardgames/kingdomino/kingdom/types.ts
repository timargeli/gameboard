import { Cell, KingdominoOptions, KDKingdom } from '../types'

export type KingdominoMap = {
  map: Cell[][] | null
  dominos: PlacedDominoJoined[]
  points: number
  sideSize: number
  kingdominoOptions: KingdominoOptions | null
  color: string
  dimensions: {
    width: number
    height: number
    minX: number
    minY: number
  }
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
  kingdom_id: KDKingdom['id'] | null
  rot: number
  x: number
  y: number
}

export type DominoToPlace = {
  value: number & { readonly __brand?: 'kd_domino_value' }
  drawnDominoId: number & { readonly __brand?: 'kd_kingdomino_domino_id' }
  color: string
  rot: number
}
