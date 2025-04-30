import { db, sql } from '../../../database/database'
import { Endpoint } from '../../../types'
import { getTurn } from '../kingdomino'
import { Topdeck } from '../kingdomino/types'
import { getTopdecks } from '../kingdomino/utils'

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
  {
    endpointType: 'post',
    path: basePath + '/get-topdeck',
    handler: async (req, res) => {
      try {
        const { kingdominoId } = req.body
        const topdecks = await getTopdecks(kingdominoId)

        res.status(201).json({
          message: 'Topdeck lekérdezése sikeült',
          topdecks,
        })
      } catch (error) {
        console.log('Error getting topdeck')
        console.log(error)
        res.status(500).json({ message: 'Error getting topdeck', error: (error as any)?.message })
      }
    },
  },
]
