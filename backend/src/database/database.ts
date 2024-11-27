import createConnectionPool, { sql } from '@databases/pg'
import tables from '@databases/pg-typed'
import DatabaseSchema from './generated'

export { sql }

export const db = createConnectionPool('postgres://postgres:123@localhost:5432/gameboard')

const {
  boardgame,
  chat,
  game,
  game_options,
  kd_domino,
  kd_kingdom,
  kd_kingdom_domino,
  kd_kingdomino_domino,
  kd_player,
  kingdomino,
  kingdomino_options,
  lobby,
  message,
  users,
} = tables<DatabaseSchema>({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  databaseSchema: require('./generated/schema.json'),
})

export {
  boardgame as boardgameTable,
  chat as chatTable,
  game as gameTable,
  game_options as game_optionsTable,
  kd_domino as kd_dominoTable,
  kd_kingdom as kd_kingdomTable,
  kd_kingdom_domino as kd_kingdom_dominoTable,
  kd_kingdomino_domino as kd_kingdomino_dominoTable,
  kd_player as kd_playerTable,
  kingdomino as kingdominoTable,
  kingdomino_options as kingdomino_optionsTable,
  lobby as lobbyTable,
  message as messageTable,
  users as usersTable,
}

// async function run() {
//   await db.query(sql`
//     INSERT INTO "user" (id, name, password)
//     VALUES (1, 'Tim', '123')
//   `)

// }

// run().catch((err) => {
//   console.error(err)
//   process.exit(1)
// })
