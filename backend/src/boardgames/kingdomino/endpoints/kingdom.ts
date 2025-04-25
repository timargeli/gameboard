import { Endpoint } from '../../../types'
import { getTurnWithPlayer } from '../kingdomino'
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
        const { kingdomId, kingdominoId } = req.body
        if (!kingdomId && !kingdominoId) {
          throw new Error('Kingdom id vagy Kingdomino id megadása kötelező')
        }
        // TEMP hegesztés, azt építjük akinek jönnie kell
        // TODO visszacsinálni ha autentikáció megvan
        let finalKingdomId = kingdomId
        if (!kingdomId) {
          const turn = await getTurnWithPlayer(kingdominoId)
          finalKingdomId = turn.player.kingdom
        }

        const kingdomMap = new KingdominoMap()
        await kingdomMap.loadAndBuild(finalKingdomId)
        kingdomMap.printMap()
        const border = kingdomMap.getKingdomBorder()
        const minX = Math.min(...kingdomMap.dominos.map((dom) => dom.x))
        const minY = Math.min(...kingdomMap.dominos.map((dom) => dom.y))
        const width = border.maxJ - border.minJ + 1
        const height = border.maxI - border.minI + 1
        console.log(border)

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
