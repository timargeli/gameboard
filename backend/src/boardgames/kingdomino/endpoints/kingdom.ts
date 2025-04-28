import { db, kd_playerTable } from '../../../database/database'
import { Endpoint } from '../../../types'
import { KingdominoMap } from '../kingdomino/kingdomino-map'

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
        const { playerId, kingdominoId } = req.body
        if (!playerId || !kingdominoId) {
          throw new Error('player id és Kingdomino id megadása kötelező')
        }
        // TODO itt user lesz majd nem player, kicsit bonyibb lekérdezés

        const kingdomId = (await kd_playerTable(db).findOne({ id: playerId }))?.kingdom
        if (!kingdomId) {
          throw new Error('Nincs kingdom a playerhez: ' + playerId)
        }

        const kingdomMap = new KingdominoMap()
        await kingdomMap.loadAndBuild(kingdomId)
        kingdomMap.printMap()
        const border = kingdomMap.getKingdomBorder()
        const minX = Math.min(...kingdomMap.dominos.map((dom) => dom.x), 0)
        const minY = Math.min(...kingdomMap.dominos.map((dom) => dom.y), 0)
        const width = border.maxJ - border.minJ + 1
        const height = border.maxI - border.minI + 1

        res.status(201).json({
          message: 'Map lekérdezése sikerült',
          map: { ...kingdomMap, dimensions: { width, height, minX, minY } },
        }) //TODO lodash pick csak az a négy property ami kell
      } catch (error) {
        console.log('Error getting map')
        console.log(error)
        res.status(500).json({ message: 'Error getting map', error: (error as any)?.message })
      }
    },
  },
]
