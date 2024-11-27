import {
  db,
  kd_kingdom_dominoTable,
  kd_kingdomino_dominoTable,
  kd_playerTable,
} from '../../../database/database'
import { getDomino } from '../../../database/utils'
import { Endpoint } from '../../../types'
import { chooseDomino, draw, getTurn } from '../kingdomino'
import { KingdominoMap } from '../kingdomino/kingdomino-map'

const basePath = '/domino'

export const dominoEndpoints: Endpoint[] = [
  {
    endpointType: 'post',
    path: basePath + '/choose',
    handler: async (req, res) => {
      try {
        const { drawnDominoId, playerId } = req.body
        if (!drawnDominoId) {
          throw new Error('Dominó megadása kötelező')
        }
        if (!playerId) {
          throw new Error('PlayerId megadása kötelező')
        }

        await chooseDomino(drawnDominoId, playerId)

        res.status(201).json({ message: 'Dominó kiválasztása sikerült' })
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
        // TODO place trash
        const { drawnDominoId, playerId, x, y, rot } = req.body
        if (!drawnDominoId) {
          throw new Error('Dominó megadása kötelező')
        }
        if (!playerId) {
          throw new Error('PlayerId megadása kötelező')
        }
        if (isNaN(x) || isNaN(y) || isNaN(rot)) {
          throw new Error('helyzethez x, y, rot megadása kötelező')
        }
        const drawnDomino = await kd_kingdomino_dominoTable(db).findOne({ id: drawnDominoId })
        if (!drawnDomino) {
          throw new Error('Nem található dominó a megadott idhoz')
        }
        if (!drawnDomino.kingdomino_id) {
          throw new Error('Nincs kingdomino a dominón')
        }
        if (drawnDomino.chosen_by_player !== playerId) {
          throw new Error('Nem a te dominód')
        }
        const player = await kd_playerTable(db).findOne({ id: playerId })
        if (!player) {
          throw new Error('Nem található játékos a megadott idhoz')
        }

        const turn = await getTurn(drawnDomino.kingdomino_id)
        if (turn.player !== playerId) {
          throw new Error('Nem a te köröd van')
        }
        if (turn.action !== 'place') {
          throw new Error('Most nem lehet dominót lerakni')
        }

        const kingdominoMap = new KingdominoMap()
        await kingdominoMap.loadAndBuild(player.kingdom)
        const toBePlaced = {
          kingdom_id: player.kingdom,
          domino_id: drawnDomino.domino_id,
          x,
          y,
          rot,
        }
        const domino = await getDomino(drawnDomino.domino_id)
        // egy kis bűvészkedés, ez a fgv úgy se használja az id-t TODO proper type
        kingdominoMap.validateDominoPlacing({
          ...toBePlaced,
          ...domino,
          id: -1,
        })

        const [placed] = await kd_kingdom_dominoTable(db).insert(toBePlaced)

        // Töröljük a kingdominobol, már a kingdomba van beépítve
        await kd_kingdomino_dominoTable(db).delete({ id: drawnDominoId })

        const drawnDominos = await kd_kingdomino_dominoTable(db)
          .find({ kingdomino_id: drawnDomino.kingdomino_id })
          .all()
        // Összes maradék dominót már választotta valaki -> húzunk újat
        if (!drawnDominos.some((dd) => !!dd.chosen_by_player)) {
          await draw(drawnDomino.kingdomino_id)
          // Elfogyott a deck is, nem volt mit húzni
          if (!drawnDominos.length) {
            // TODO !!! end game logika, statek lobby state, game state?
          }
        }

        // olcsóbb lenne beépítős függvény is, mint az egészet újra felépíteni
        const points = await kingdominoMap.loadAndBuild(player.kingdom)

        // temporary, prints map to console
        kingdominoMap.printMap()

        res.status(201).json({ message: 'Dominó beépítése sikerült', points: points, placedDomino: placed })
      } catch (error) {
        console.log('Error building domino')
        console.log(error)
        res.status(500).json({ message: 'Error building domino', error: (error as any)?.message })
      }
    },
  },
]
