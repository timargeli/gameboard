import { Server } from 'socket.io'
import { setupBoardgameSockets } from '../boardgames/sockets'
import { setupLobbySockets } from './lobby'

export const setupSockets = (io: Server) => {
  setupBoardgameSockets(io)
  setupLobbySockets(io)
}
