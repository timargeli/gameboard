import { Server } from 'socket.io'
import { setupBoardgameSockets } from '../boardgames/sockets'

export const setupSockets = (io: Server) => {
  setupBoardgameSockets(io)
}
