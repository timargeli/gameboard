import { db, sql } from '../../../database/database'
import { Endpoint } from '../../../types'
import { getTurn } from '../kingdomino'
import { Topdeck } from '../kingdomino/types'

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
        if (!kingdominoId) {
          throw new Error('Kingdomino id megadása kötelező')
        }
        const topdeck = (await db.query(sql`
          SELECT dom.value, kdd.id, p.color, kdd.parity FROM kd_kingdomino_domino kdd
          JOIN kd_domino dom ON dom.value = kdd.domino_id
          LEFT JOIN kd_player p ON p.id = kdd.chosen_by_player
          WHERE kdd.kingdomino_id=${kingdominoId}
        `)) as Topdeck[]

        const topdeckTrue = topdeck.filter((d) => d.parity).sort((d) => d.value)
        const topdeckFalse = topdeck.filter((d) => !d.parity).sort((d) => d.value)
        // Sorrend eldöntése: Az lesz elöl amelyikben több elem van, vagy amiben van választott dominó
        const parity =
          topdeckTrue.length > topdeckFalse.length ||
          (topdeckTrue.length === topdeckFalse.length && topdeckTrue.find((d) => !!d.color))

        res.status(201).json({
          message: 'Topdeck lekérdezése sikeült',
          topdecks: (parity ? [topdeckTrue, topdeckFalse] : [topdeckFalse, topdeckTrue]).filter(
            (array) => !!array.length,
          ),
        })
      } catch (error) {
        console.log('Error getting topdeck')
        console.log(error)
        res.status(500).json({ message: 'Error getting topdeck', error: (error as any)?.message })
      }
    },
  },
]
