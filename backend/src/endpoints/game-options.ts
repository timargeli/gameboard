import { Kingdomino } from '../boardgames/kingdomino'
import { db, game_optionsTable } from '../database/database'
import { Endpoint } from '../types'

const basePath = '/game-options'

export const gameoptionsEndpoints: Endpoint[] = [
  {
    endpointType: 'get',
    path: basePath + '/get-descriptor',
    handler: async (req, res) => {
      try {
        const { gameName } = req.query
        if (!gameName) {
          throw new Error('Játék megadása kötelező')
        }

        switch (gameName) {
          case 'kingdomino':
            res.status(201).json(Kingdomino.gameOptionsDescriptor)
            break
          default:
            throw new Error('Nem létező játéktípus')
        }
      } catch (error) {
        console.log('Error getting game options descrptor')
        console.log(error)
        res
          .status(500)
          .json({ message: 'Error getting game options descrptor', error: (error as any)?.message })
      }
    },
  },
  {
    endpointType: 'post',
    path: basePath + '/create',
    handler: async (req, res) => {
      try {
        const { gameName } = req.body
        if (!gameName) {
          throw new Error('Játék megadása kötelező')
        }

        switch (gameName) {
          case 'kingdomino':
            const newKingdominoOptions = await Kingdomino.createGameOptions(req)
            const newOptions = await game_optionsTable(db).insert({
              game_name: 'kingdomino',
              kingdomino_options: newKingdominoOptions,
            })
            res.status(201).json(newOptions[0]?.id)
            break
          default:
            throw new Error('Nem létező játéktípus')
        }
      } catch (error) {
        console.log('Error creating game options')
        console.log(error)
        res.status(500).json({ message: 'Error creating game options', error: (error as any)?.message })
      }
    },
  },
]
