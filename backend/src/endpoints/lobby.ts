import { Kingdomino } from '../boardgames/kingdomino'
import { db, game_optionsTable, gameTable, lobbyTable } from '../database/database'
import { Lobby_InsertParameters } from '../database/generated'
import { getLobby } from '../database/utils'
import { Endpoint, GameStateString } from '../types'

const basePath = '/lobby'

export const lobbyEndpoints: Endpoint[] = [
  {
    endpointType: 'post',
    path: basePath + '/create',
    handler: async (req, res) => {
      try {
        const { gameName, gameOptions, minPlayers, maxPLayers } = req.body
        if (!gameName) {
          throw new Error('Játék megadása kötelező')
        }
        if (!gameOptions) {
          throw new Error('Játékbeállítások megadása kötelező')
        }
        if (!minPlayers) {
          throw new Error('Minimum játékosok számának megadása kötelező')
        }
        if (!maxPLayers) {
          throw new Error('Maxmimum játékosok számának megadása kötelező')
        }
        const lobby: Lobby_InsertParameters = {
          state: 'waiting',
          game_name: gameName,
          game_options: gameOptions,
          min_players: minPlayers,
          max_players: maxPLayers,
          players: [], //TODO add self user
          date_created: new Date(),
        }
        const newLobby = await lobbyTable(db).insert(lobby)
        res.status(201).json({ message: 'Lobby created', lobby: newLobby })
      } catch (error) {
        console.log('Error creating lobby')
        console.log(error)
        res.status(500).json({ message: 'Error creating lobby', error: (error as any)?.message })
      }
    },
  },
  {
    endpointType: 'post',
    path: basePath + '/join',
    handler: async (req, res) => {
      try {
        const { lobbyId } = req.body

        // TODO self id
        // TODO user already in validation
        const selfUserId = 2

        const lobby = await getLobby(lobbyId)

        if (lobby.players?.length && lobby.players.includes(-1)) {
          throw new Error('User already in lobby')
        }

        if (lobby.state !== 'waiting') {
          throw new Error('Game already ' + lobby.state)
        }

        const [result] = await lobbyTable(db).update(
          { id: lobbyId },
          { players: (lobby.players || []).concat(selfUserId) },
        )

        res.status(201).json({ message: 'Joined lobby', lobby: result })
      } catch (error) {
        console.log('Error joining lobby')
        console.log(error)
        res.status(500).json({ message: 'Error joining lobby', error: (error as any)?.message })
      }
    },
  },
  {
    endpointType: 'post',
    path: basePath + '/join-temp',
    handler: async (req, res) => {
      try {
        const { lobbyId, userId } = req.body

        if (!userId) {
          throw new Error('UserId megadása kötelező')
        }

        const lobby = await getLobby(lobbyId)

        const [result] = await lobbyTable(db).update(
          { id: lobbyId },
          { players: (lobby.players || []).concat(userId) },
        )

        res.status(201).json({ message: 'Joined lobby', lobby: result })
      } catch (error) {
        console.log('Error joining lobby')
        console.log(error)
        res.status(500).json({ message: 'Error joining lobby', error: (error as any)?.message })
      }
    },
  },
  {
    endpointType: 'post',
    path: basePath + '/start',
    handler: async (req, res) => {
      try {
        const { lobbyId } = req.body
        const lobby = await getLobby(lobbyId)

        if ((lobby.players?.length || 0) < lobby.min_players) {
          throw new Error('Nincs elegendő játékos a lobbyban')
        }

        let boardGameId = -1

        // Create the specific boardgame
        switch (lobby.game_name) {
          case 'kingdomino':
            boardGameId = await Kingdomino.createBoardGame(lobby)
            break
          default:
            throw new Error('Nem létező játéktípus')
        }

        if (boardGameId === -1) {
          throw new Error('Nem sikerült a boardgame-t elindítani')
        }

        // Create game
        const [game] = await gameTable(db).insert({
          boardgame: boardGameId,
          chats: [],
          date_created: new Date(),
          game_name: lobby.game_name,
          players: lobby.players,
        })

        if (!game) {
          throw new Error('Nem sikerült a game-t létrehozni')
        }

        //update lobby
        await lobbyTable(db).update({ id: lobbyId }, { game: game.id, state: GameStateString.inGame })

        res.status(201).json({ message: 'Lobby started' })
      } catch (error) {
        console.log('Error starting lobby')
        console.log(error)
        res.status(500).json({ message: 'Error starting lobby', error: (error as any)?.message })
      }
    },
  },
  {
    endpointType: 'post',
    path: basePath + '/delete',
    handler: async (req, res) => {
      try {
        const { lobbyId, forceGameDelete } = req.body
        const lobby = await getLobby(lobbyId)

        // Delete game specific stuff
        if (forceGameDelete) {
          switch (lobby.game_name) {
            case 'kingdomino':
              await Kingdomino.handleLobbyDeletion(lobby)
              break
            default:
              throw new Error('Nem létező játéktípus')
          }
        }

        // Delete generic stuff
        if (lobby.game) {
          gameTable(db).delete({ id: lobby.game })
        }
        if (lobby.game_options) {
          game_optionsTable(db).delete({ id: lobby.game_options })
        }
        lobbyTable(db).delete({ id: lobby.id })

        res.status(201).json({ message: 'Lobby deleted' })
      } catch (error) {
        console.log('Error deleting lobby')
        console.log(error)
        res.status(500).json({ message: 'Error deleting lobby', error: (error as any)?.message })
      }
    },
  },
]
