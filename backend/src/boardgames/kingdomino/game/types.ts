export type PlayerData = {
  id: number
  points: number
  color: string
  name: string
}

export type BulkInsertKDPlayerParameters = {
  user: number | null
  kingdom: number
  color: string
  points: number
}

export type BulkInsertKDKingdomParameters = {
  color: string
}
