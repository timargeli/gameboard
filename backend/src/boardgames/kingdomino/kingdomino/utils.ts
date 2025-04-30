import { getTurn } from '.'
import {
  kingdominoTable,
  db,
  kingdomino_optionsTable,
  boardgameTable,
  gameTable,
  kd_playerTable,
  sql,
} from '../../../database/database'
import { KdPlayer, Kingdomino } from '../../../database/generated'
import { Cell, CellType, GameState, GameStateString } from '../types'
import { PlacedDominoJoined, Topdeck } from './types'

// Egy dominóból két cellát számol, forgatás és pozicó alapján
export const createCellData = (pdom: PlacedDominoJoined) => {
  const posToInd = (pos: { x: number; y: number }) => {
    return {
      i: -pos.y + 6,
      j: pos.x + 6,
    }
  }
  const c1pos = {
    x: pdom.x,
    y: pdom.y,
  }
  const c1ind = posToInd(c1pos)
  let c2pos
  switch (pdom.rot) {
    case 0:
      c2pos = {
        x: c1pos.x + 1,
        y: c1pos.y,
      }
      break
    case 1:
      c2pos = {
        x: c1pos.x,
        y: c1pos.y - 1,
      }
      break
    case 2:
      c2pos = {
        x: c1pos.x - 1,
        y: c1pos.y,
      }
      break
    case 3:
      c2pos = {
        x: c1pos.x,
        y: c1pos.y + 1,
      }
      break
    default:
      throw new Error('Invalid rotation, kdDomino id: ' + pdom.id)
  }
  const c2ind = posToInd(c2pos)

  const c1: Cell = {
    type: pdom.left_cell_type as CellType,
    crowns: pdom.left_cell_crowns || 0,
    i: c1ind.i,
    j: c1ind.j,
  }
  const c2: Cell = {
    type: pdom.right_cell_type as CellType,
    crowns: pdom.right_cell_crowns || 0,
    i: c2ind.i,
    j: c2ind.j,
  }

  return { c1, c2 }
}

export const getKingdominoOptions = async (kingdominoId: Kingdomino['id'] | null) => {
  if (!kingdominoId) {
    throw new Error('Nincs kingdomino_id a kingdomon')
  }
  const kingdomino = await kingdominoTable(db).findOne({ id: kingdominoId })
  if (!kingdomino) {
    throw new Error('Nincs kingdomino a kingdom_id-n. kingdomino id: ' + kingdominoId)
  }
  if (!kingdomino.options) {
    throw new Error('Nincs options a kingdomino-n. kingdomino id: ' + kingdomino.id)
  }
  const kingdominoOptions = await kingdomino_optionsTable(db).findOne({ id: kingdomino.options })
  if (!kingdominoOptions) {
    throw new Error('Nincs kingdomino-hoz tartozó options. kingdomino id: ' + kingdomino.id)
  }
  return kingdominoOptions
}

export const getGameId = async (kingdominoId?: Kingdomino['id'] | null) => {
  if (!kingdominoId) {
    throw new Error('kingdominoId megadása kötelező')
  }
  const boardGame = await boardgameTable(db).findOne({ kingdomino: kingdominoId })
  if (!boardGame) {
    throw new Error('Nincs a megadott kingdominó idhoz boardgame ' + kingdominoId)
  }
  const game = await gameTable(db).findOne({ boardgame: boardGame.id })
  if (!game) {
    throw new Error('Nincs a megadott kingdominó idhoz game ' + kingdominoId)
  }
  return game.id
}

export const getPlayer = async (playerId: KdPlayer['id']) => {
  const player = await kd_playerTable(db).findOne({ id: playerId })
  if (!player) {
    throw new Error('Nincs ilyen id-jú player: ' + playerId)
  }
  return player
}

export const getTopdecks = async (kingdominoId: number | null) => {
  if (!kingdominoId) {
    throw new Error('Kingdomino id megadása kötelező')
  }
  const topdeck = (await db.query(sql`
    SELECT dom.value, kdd.id, p.color, kdd.parity FROM kd_kingdomino_domino kdd
    JOIN kd_domino dom ON dom.value = kdd.domino_id
    LEFT JOIN kd_player p ON p.id = kdd.chosen_by_player
    WHERE kdd.kingdomino_id=${kingdominoId}
  `)) as Topdeck[]

  const topdeckTrue = topdeck.filter((d) => d.parity).sort((d) => d.value)
  const topdeckFalse = topdeck.filter((d) => !d.parity).sort((d) => d.value)
  // Sorrend eldöntése: Az lesz elöl amelyikben több elem van, vagy amiben van választott dominó
  // const parity =
  //   topdeckTrue.length > topdeckFalse.length ||
  //   (topdeckTrue.length === topdeckFalse.length && topdeckTrue.find((d) => !!d.color))
  //   topdecks: (parity ? [topdeckTrue, topdeckFalse] : [topdeckFalse, topdeckTrue]).filter(
  //     (array) => !!array.length,

  // inkább csak true false sorrend, ne ugráljon
  return [topdeckFalse, topdeckTrue].filter((array) => !!array.length)
}

export const getGameState = async (kingdominoId: number): Promise<GameState> => {
  const state = (
    await db.query(sql`select state
    from lobby l
    join game g on l.game = g.id
    join boardgame bg on g.boardgame = bg.id
    where bg.kingdomino = ${kingdominoId}`)
  )[0] as GameStateString
  const turn = await getTurn(kingdominoId)
  const topdecks = await getTopdecks(kingdominoId)
  return {
    gameState: state,
    turn,
    topdecks,
  }
}
