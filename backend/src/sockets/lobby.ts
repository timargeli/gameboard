import { Server } from 'socket.io'
import { getLobbies } from '../utils'

export const setupLobbySockets = (io: Server) => {
  io.of('/lobbies').on('connection', (socket) => {
    console.log('Új kliens csatlakozott lobbikhoz:', socket.id)

    // Join az összes lobbies-ra
    socket.on('join-lobbies', async () => {
      const lobbies = await getLobbies()
      io.of('/lobbies').emit('lobbies', lobbies)
    })

    // Join egy konkrét lobbyba
    socket.on('join-lobby', async ({ lobbyId }) => {
      socket.join(lobbyId)
      // Frissítés a többieknek
      const lobbies = await getLobbies()
      io.of('/lobbies').emit('lobbies', lobbies)
      //   const lobby = await getLobby(lobbyId)
      //   io.of('/lobbies').to(lobbyId).emit('lobby', lobby)
    })

    // Leave from a lobby
    socket.on('leave-lobby', async ({ lobbyId }) => {
      socket.join(lobbyId)
      //   const lobby = await getLobby(lobbyId)
      //   io.of('/lobbies').to(lobbyId).emit('lobby', lobby)
    })

    socket.on('disconnect', () => {
      console.log('Kliens lecsatlakozott lobbikból:', socket.id)
    })
  })
}
