import { Endpoint } from '../../../types'
import { chooseDomino, placeDomino } from '../kingdomino'

const basePath = '/domino'

export const dominoEndpoints: Endpoint[] = [
  {
    endpointType: 'post',
    path: basePath + '/choose',
    handler: async (req, res) => {
      try {
        const { drawnDominoId, userId } = req.body
        if (!drawnDominoId) {
          throw new Error('Dominó megadása kötelező')
        }
        if (!userId) {
          throw new Error('UserId megadása kötelező')
        }

        //TODO !! validation, a drawnDomino tényleg saját kingdominoban van? placere szintén
        const nextTurn = await chooseDomino(drawnDominoId, userId)

        res.status(201).json({ message: 'Dominó kiválasztása sikerült', turn: nextTurn })
      } catch (error) {
        console.log('Error choosing domino')
        console.log(error)
        res.status(500).json({ message: 'Error choosing domino', error: (error as any)?.message })
      }
    },
  },
  {
    endpointType: 'post',
    path: basePath + '/place',
    handler: async (req, res) => {
      try {
        // TODO ! code cleanup, mi ez a hányás
        // TODO !! validation, ez a dominó jön beépítésre? getturn visszatérése bővítés
        const { drawnDominoId, userId, x, y, rot, inTrash } = req.body
        const { message, map, points } = await placeDomino(drawnDominoId, userId, x, y, rot, inTrash)

        res.status(201).json({
          message,
          points,
          map,
        })
      } catch (error) {
        console.log('Error building domino')
        console.log(error)
        res.status(500).json({ message: 'Error building domino', error: (error as any)?.message })
      }
    },
  },
]
