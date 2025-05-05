import { Request, Response, NextFunction } from 'express'
import { db, sql } from './database/database'
import { LobbyItem } from './types'

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
