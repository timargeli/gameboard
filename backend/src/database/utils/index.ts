import { game_optionsTable, db, kingdomino_optionsTable, lobbyTable, kd_dominoTable } from '../database'
import { KdDomino, Lobby } from '../generated'

export const getGameOptions = async (gameOptionsId?: number | null) => {
  if (!gameOptionsId) {
    throw new Error('Hiányzó játékbeállítások a lobbyban')
  }
  const gameOptions = await game_optionsTable(db).findOne({ id: gameOptionsId })
  if (!gameOptions?.kingdomino_options) {
    throw new Error('Hiányzó játékbeállítások')
  }
  switch (gameOptions.game_name) {
    case 'kingdomino':
      const KingdominoOptions = await kingdomino_optionsTable(db).findOne({
        id: gameOptions.kingdomino_options,
      })
      if (!KingdominoOptions) {
        throw new Error('Hiányzó Kingdomino beállítások')
      }
      return KingdominoOptions
    default:
      throw new Error('Rossz játéktípus')
  }
}

export const getLobby = async (lobbyId?: number | null) => {
  if (!lobbyId) {
    throw new Error('Lobby ID megadása kötelező')
  }
  const lobby = await lobbyTable(db).findOne({ id: lobbyId })
  if (!lobby) {
    throw new Error('Nincs lobby a megadott ID-hoz')
  }
  return lobby
}

export const getDomino = async (dominoId?: KdDomino['value'] | null) => {
  if (!dominoId) {
    throw new Error('Dominó ID megadása kötelező')
  }
  const domino = await kd_dominoTable(db).findOne({ value: dominoId })
  if (!domino) {
    throw new Error('Nincs dominó a megadott id-hoz')
  }
  return domino
}

//TODO lobbystate
export const setLobbyState = async (lobbyId: Lobby['id'], state: any) => {
  if (!lobbyId) {
    throw new Error('Dominó ID megadása kötelező')
  }
  const lobby = await lobbyTable(db).update({ id: lobbyId }, { state: state })
}
