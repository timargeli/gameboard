import {
  db,
  kd_kingdom_dominoTable,
  kd_kingdomino_dominoTable,
  kd_playerTable,
} from '../../../database/database'
import { endGame, getDomino } from '../../../database/utils'
import { Endpoint } from '../../../types'
import { getEndgameResults } from '../game'
import { chooseDomino, draw, getTurn } from '../kingdomino'
import { KingdominoMap } from '../kingdomino/kingdomino-map'
import { getGameId } from '../kingdomino/utils'

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

        //TODO !! validation, a drawnDomino tényleg saját kingdominoban van? placere szintén
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
        // TODO !! validation, ez a dominó jön beépítésre? getturn visszatérése bővítés
        const { drawnDominoId, playerId, x, y, rot, inTrash } = req.body
        if (!drawnDominoId) {
          throw new Error('Dominó megadása kötelező')
        }
        if (!playerId) {
          throw new Error('PlayerId megadása kötelező')
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
        if (turn.player.id !== playerId) {
          throw new Error('Nem a te köröd van')
        }
        if (turn.action !== 'place') {
          throw new Error('Most nem lehet dominót lerakni')
        }
        const kingdominoMap = new KingdominoMap()
        await kingdominoMap.loadAndBuild(player.kingdom)
        // Kidobjuk a dominót, az építős kód ilyenkor nem kell
        if (!inTrash) {
          // Beépítés
          if (isNaN(x) || isNaN(y) || isNaN(rot)) {
            throw new Error('helyzethez x, y, rot megadása kötelező')
          }

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
        }

        // Töröljük a kingdominobol, már a kingdomba van beépítve VAGY ki van dobva
        await kd_kingdomino_dominoTable(db).delete({ id: drawnDominoId })

        const drawnDominos = await kd_kingdomino_dominoTable(db)
          .find({ kingdomino_id: drawnDomino.kingdomino_id })
          .all()
        // Összes maradék dominót már választotta valaki -> húzunk újat
        if (drawnDominos.every((dd) => !!dd.chosen_by_player)) {
          await draw(drawnDomino.kingdomino_id)

          // Elfogyott az összes drawnDomino + deck is, nem volt mit húzni -> endgame
          const drawnDominos = await kd_kingdomino_dominoTable(db)
            .find({ kingdomino_id: drawnDomino.kingdomino_id })
            .all()
          if (!drawnDominos.length) {
            const gameId = await getGameId(drawnDomino.kingdomino_id)
            await endGame(gameId)
            // TODO jobb endgame results
            const results = await getEndgameResults(drawnDomino.kingdomino_id)
            res.status(201).json({
              message: 'Utolsó dominó beépítése sikerült, a játék véget ért',
              results: results,
              map: kingdominoMap, //TODO itt nem olyan mapot vár lásd lejjebb
            })
            return
          }
        }

        // olcsóbb lenne beépítős függvény is, mint az egészet újra felépíteni
        const points = await kingdominoMap.loadAndBuild(player.kingdom)

        // temporary, prints map to console
        kingdominoMap.printMap()
        const border = kingdominoMap.getKingdomBorder()
        const minX = Math.min(...kingdominoMap.dominos.map((dom) => dom.x), 0)
        const minY = Math.min(...kingdominoMap.dominos.map((dom) => dom.y), 0)
        const width = border.maxJ - border.minJ + 1
        const height = border.maxI - border.minI + 1

        res.status(201).json({
          message: inTrash ? 'Dominó kukába helyezve' : 'Dominó beépítése sikerült',
          points: points,
          map: { ...kingdominoMap, dimensions: { width, height, minX, minY } },
        })
      } catch (error) {
        console.log('Error building domino')
        console.log(error)
        res.status(500).json({ message: 'Error building domino', error: (error as any)?.message })
      }
    },
  },
]
