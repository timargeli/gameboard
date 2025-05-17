import { db, kd_playerTable } from '../../../database/database'
import { Endpoint } from '../../../types'
import { KingdominoMap } from '../kingdomino/kingdomino-map'
import { getPlayerFromUser } from '../kingdomino/utils'

const basePath = '/kingdom'

export const kingdomEndpoints: Endpoint[] = [
  {
    endpointType: 'post',
    path: basePath + '/get-points',
    handler: async (req, res) => {
      try {
        const { kingdomId } = req.body
        if (!kingdomId) {
          throw new Error('Kingdom id megadása kötelező')
        }

        const kingdomMap = new KingdominoMap()
        const points = await kingdomMap.loadAndBuild(kingdomId)
        kingdomMap.printMap()

        res.status(201).json({ message: 'Kingdom pontszámítás sikerült', points: points })
      } catch (error) {
        console.log('Error calculating points for kingdom')
        console.log(error)
        res
          .status(500)
          .json({ message: 'Error calculating points for kingdom', error: (error as any)?.message })
      }
    },
  },
  {
    endpointType: 'post',
    path: basePath + '/get-map',
    handler: async (req, res) => {
      try {
        const { userId, kingdominoId } = req.body

        const player = await getPlayerFromUser(userId, kingdominoId)
        if (!player.kingdom) {
          throw new Error('Nincs kingdom a playerhez: ' + player.id)
        }

        const kingdomMap = new KingdominoMap()
        await kingdomMap.loadAndBuild(player.kingdom)
        const border = kingdomMap.getKingdomBorder()

        res.status(201).json({
          message: 'Map lekérdezése sikerült',
          map: { ...kingdomMap, dimensions: border },
        })
      } catch (error) {
        console.log('Error getting map')
        console.log(error)
        res.status(500).json({ message: 'Error getting map', error: (error as any)?.message })
      }
    },
  },
]
