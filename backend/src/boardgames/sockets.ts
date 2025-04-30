import { Server } from 'socket.io'
import { setupKingdominoSockets } from './kingdomino/socket'

export const setupBoardgameSockets = (io: Server) => {
  setupKingdominoSockets(io)
}
