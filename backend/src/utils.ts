import { Request, Response, NextFunction } from 'express'
import { db, lobbyTable, sql } from './database/database'
import { LobbyItem } from './types'
import { Boardgame } from './database/generated'

// Error handling
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err.message)
  console.error('Stack:', err.stack)

  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
  })
}

export const getLobbies = async () => {
  return (await db.query(sql`
    SELECT
      l.*,
      COALESCE(string_agg(u.name, ', '), '') AS player_names
    FROM
      lobby l
      LEFT JOIN LATERAL unnest(l.players) AS player_id(id) ON TRUE
      LEFT JOIN users u ON u.id = player_id.id
    GROUP BY l.id
    ORDER BY l.state DESC, l.date_created DESC;
  `)) as LobbyItem[]
}

export const getLobby = async (lobbyId: number): Promise<LobbyItem> => {
  const lobby = (
    await db.query(sql`
    SELECT
      l.*,
      COALESCE(string_agg(u.name, ', '), '') AS player_names
    FROM
      lobby l
      LEFT JOIN LATERAL unnest(l.players) AS player_id(id) ON TRUE
      LEFT JOIN users u ON u.id = player_id.id
    WHERE l.id = ${lobbyId}
    GROUP BY l.id
    ORDER BY l.state DESC, l.date_created DESC;
  `)
  )[0] as LobbyItem
  const boardgame = (
    await db.query(sql`
      SELECT bg.*
      FROM lobby l
      JOIN game g on g.id = l.game
      JOIN boardgame bg on bg.id = g.boardgame
      WHERE l.id = ${lobbyId};
    `)
  )[0] as Boardgame

  switch (lobby.game_name) {
    case 'kingdomino':
      return { ...lobby, boardgame: boardgame?.kingdomino }
    default:
      return lobby
  }
}

export const leaveFromLobby = async (lobbyId: number, userId: number) => {
  if (!lobbyId) {
    throw new Error('Lobby ID megadása kötelező')
  }
  const lobby = await lobbyTable(db).findOne({ id: lobbyId })
  if (!lobby) {
    throw new Error('Nincs lobby a megadott ID-hoz: ' + lobbyId)
  }
  if (!lobby.players?.length) {
    throw new Error('Nincs játékos a lobbyban: ' + lobbyId)
  }
  lobby.players.splice(lobby.players.indexOf(userId))
  await lobbyTable(db).update({ id: lobby.id }, { players: lobby.players })
}
