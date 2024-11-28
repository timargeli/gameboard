import { Endpoint } from '../../../types'
import { draw, getTurn } from '../kingdomino'

const basePath = '/kingdomino'

export const kingdominoEndpoints: Endpoint[] = [
  {
    endpointType: 'post',
    path: basePath + '/get-turn',
    handler: async (req, res) => {
      try {
        const { kingdominoId } = req.body
        if (!kingdominoId) {
          throw new Error('Kingdomino id megadása kötelező')
        }
        const turn = await getTurn(kingdominoId)

        res.status(201).json({ message: 'Kör kiszámítása sikerült', turn })
      } catch (error) {
        console.log('Error getting turn')
        console.log(error)
        res.status(500).json({ message: 'Error getting turn', error: (error as any)?.message })
      }
    },
  },
]
