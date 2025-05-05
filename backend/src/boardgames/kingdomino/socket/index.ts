import { Server } from 'socket.io'
import { getGameState } from '../kingdomino/utils'
import { chooseDomino } from '../kingdomino'

export const setupKingdominoSockets = (io: Server) => {
  // Példa: Socket.IO események
  io.of('/kingdomino').on('connection', (socket) => {
    console.log('Új kliens csatlakozott kingdominohoz:', socket.id)

    socket.on('join-game', async ({ kingdominoId, playerId }) => {
      socket.join(kingdominoId) // <-- szoba az adott játékhoz
      const gameState = await getGameState(kingdominoId)
      io.of('/kingdomino').to(kingdominoId).emit('game-state', gameState)
    })

    socket.on('choose-domino', async ({ kingdominoId, drawnDominoId, playerId }, callback) => {
      try {
        // TODO a chooseDomino visszatár a turnnel, azt bele gamesattetbe
        await chooseDomino(Number(drawnDominoId), Number(playerId))
        const gameState = await getGameState(Number(kingdominoId))
        io.of('/kingdomino').to(kingdominoId).emit('game-state', gameState)
        // Sikeres válasz a kliensnek
        callback && callback({ success: true })
      } catch (error) {
        // Hiba válasz a kliensnek
        callback && callback({ success: false, message: (error as Error).message })
      }
    })

    socket.on('place-domino', async ({ kingdominoId, x, y, rot, inTrash, drawnDominoId, playerId }) => {
      // ...játéklogika
      // Broadcast az adott játék szobájába:
      // Ezt csinálhatja az endpoint, itt csak broadcastelünk
      // await placeDomino(drawnDominoId, playerId, x, y, rot, inTrash)

      const gameState = await getGameState(Number(kingdominoId))
      io.of('/kingdomino').to(kingdominoId).emit('game-state', gameState)
    })

    socket.on('disconnect', () => {
      console.log('Kliens lecsatlakozott kingdominóból:', socket.id)
    })
  })
}
