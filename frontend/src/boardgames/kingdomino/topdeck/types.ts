export type Topdeck = {
  value: number & { readonly __brand?: 'kd_domino_value' }
  parity: boolean
  color: string
  id: number & { readonly __brand?: 'kd_kingdomino_domino_id' }
}

export {}
