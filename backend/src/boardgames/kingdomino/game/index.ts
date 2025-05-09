import {
  boardgameTable,
  db,
  kd_kingdomTable,
  kd_playerTable,
  kingdomino_optionsTable,
  kingdominoTable,
  sql,
} from '../../../database/database'
import { Boardgame, Kingdomino, KingdominoOptions, Lobby } from '../../../database/generated'
import { getGameOptions } from '../../../database/utils'
import { draw } from '../kingdomino'
import { colors } from '../types'
import { BulkInsertKDKingdomParameters, BulkInsertKDPlayerParameters, PlayerData } from './types'

export const deleteGame = async (boardgameId: Boardgame['id']) => {
  const boardgame = await boardgameTable(db).findOne({ id: boardgameId })
  if (boardgame?.kingdomino) {
    // TODO ! delete every kingdomino entity
    kingdominoTable(db).delete({ id: boardgame.kingdomino })
  }
}

export const createAndInitBoardGame = async (lobby: Lobby) => {
  const kingdominoOptions = (await getGameOptions(lobby.game_options)) as KingdominoOptions
  return await initBoardGame(lobby, kingdominoOptions)
}

// Létrehozza a boardGame-t és a kingdominohoz szükséges dolgokat, pl deck, játékosok, kingdomok
const initBoardGame = async (lobby: Lobby, kingdominoOptions: KingdominoOptions) => {
  try {
    if (!lobby.players?.length) {
      throw new Error('Nincsenek játékosok a lobbyban')
    }
    // Kikapcsoljuk a big kingdom beállítást, ha nem csak két játékos van
    if (kingdominoOptions.big_kingdom_enabled && lobby.players.length > 2) {
      await kingdomino_optionsTable(db).update({ id: kingdominoOptions.id }, { big_kingdom_enabled: false })
      kingdominoOptions.big_kingdom_enabled = false
    }
    const isBigMap = kingdominoOptions.big_kingdom_enabled
    const deckSize = lobby.players.length * 12 * (isBigMap ? 2 : 1)
    // create deck, 1-48 ig array, randomizaljuk, vesszük utsó decksize elemét
    const deck = [...Array(48).keys()]
      .map((i) => ({ value: i + 1, random: Math.random() }))
      .sort((a, b) => b.random - a.random)
      .map((a) => a.value)
      .slice(-deckSize)

    const shuffledColors = colors
      .map((c) => ({ color: c, random: Math.random() }))
      .sort((cr1, cr2) => cr1.random - cr2.random)
      .map((cr) => cr.color)

    const kdKingdomsRaw: BulkInsertKDKingdomParameters[] = []
    lobby.players.forEach((p, index) => {
      kdKingdomsRaw.push({
        color: shuffledColors[index],
      })
    })
    const kdKingdoms = await kd_kingdomTable(db).bulkInsert({
      columnsToInsert: ['color'],
      records: kdKingdomsRaw,
    })
    if (!kdKingdoms.length) {
      throw new Error('Nem sikerült a királyságokat létrehozni')
    }

    const kdPlayersRaw: BulkInsertKDPlayerParameters[] = []
    lobby.players.forEach((p, index: number) => {
      kdPlayersRaw.push({
        user: p,
        kingdom: kdKingdoms[index].id,
        color: shuffledColors[index],
        points: 0,
      })
    })
    const kdPlayers = await kd_playerTable(db).bulkInsert({
      columnsToInsert: ['user', 'kingdom', 'color', 'points'],
      records: kdPlayersRaw,
    })
    if (!kdPlayers.length) {
      throw new Error('Nem sikerült a játékosokat létrehozni')
    }

    const [kingdomino] = await kingdominoTable(db).insert({
      deck: deck,
      drawn_dominos: [],
      players: kdPlayers.map((kdp) => kdp.id),
      options: kingdominoOptions.id,
    })
    if (!kingdomino) {
      throw new Error('Nem sikerült a kingdominót létrehozni')
    }

    // update kingdom to have kingdomino_id for easier access later
    const updatedKingdoms = await kd_kingdomTable(db).bulkUpdate({
      whereColumnNames: ['id'],
      setColumnNames: ['kingdomino_id'],
      updates: kdKingdoms.map((kd) => {
        return { where: { id: kd.id }, set: { kingdomino_id: kingdomino.id } }
      }),
    })
    if (!updatedKingdoms.length) {
      throw new Error('Nem sikerült a kingdomokat kingdominoId-vel updatelni')
    }

    await draw(kingdomino)

    const [boardGame] = await boardgameTable(db).insert({
      game_name: 'kingdomino',
      kingdomino: kingdomino.id,
    })
    if (!boardGame) {
      throw new Error('Nem sikerült a boardgame-t létrehozni')
    }
    return boardGame.id
  } catch (error) {
    console.log('Hiba történt initBoardGame közben')
    console.log(error)
  }
  return -1
}

// Visszaadja a megadott kingomdinohoz tartozó játékosokat pontszámuk szerint csökkenő sorrendben
export const getEndgameResults = async (kingdominoId: Kingdomino['id'] | null) => {
  if (!kingdominoId) {
    throw new Error('kingdomoni Id endgameresulthoz kötelező')
  }
  const players = (await db.query(sql`
    SELECT p.id, p.color, p.points, u.name
    FROM kd_player p
    JOIN users u on p.user = u.id
    JOIN kd_kingdom k on p.kingdom = k.id
    WHERE k.kingdomino_id=${kingdominoId}
  `)) as PlayerData[]

  return players.sort((p1, p2) => p2.points - p1.points)
}
