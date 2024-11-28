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
]
