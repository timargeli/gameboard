import express from 'express'
import cors from 'cors'
import { loadEndpoints } from './endpoints/endpoints'
import { errorHandler } from './utils'
import { db } from './database/database'
import { Server } from 'socket.io'
import http from 'http'
import { setupSockets } from './sockets/sockets'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

loadEndpoints(app)

app.get('/', (req, res) => {
  res.send({ message: 'Hello, TypeScript Node Express!' })
})

app.use(errorHandler)

// --- SOCKET.IO INTEGRÁCIÓ ---
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*', // vagy a frontend URL-je
    methods: ['GET', 'POST'],
  },
})

// Példa: Socket.IO események
// io.on('connection', (socket) => {
//   console.log('Új kliens csatlakozott:', socket.id)

setupSockets(io)

//   socket.on('join-game', ({ kingdominoId, playerId }) => {
//     socket.join(kingdominoId)
//     // Küldjük vissza az aktuális turn-t csak ennek a kliensnek
//     if (games[kingdominoId]) {
//       socket.emit('turn-update', games[kingdominoId].turn)
//     }
//   })

//   socket.on('choose-domino', async ({ kingdominoId, drawnDominoId, playerId }) => {
//     // Itt történik a játéklogika
//     // Példa: új turn generálása
//     const newTurn: Turn = await chooseDomino(drawnDominoId, playerId)
//     // Frissítjük a szerver memóriájában is
//     games[kingdominoId] = { turn: newTurn }

//     // 1. Visszaküldjük csak annak, aki lépett (ACK)
//     socket.emit('turn-update', newTurn)

//     // 2. Mindenki másnak is broadcastoljuk a szobában (kivéve a lépőt)
//     socket.to(kingdominoId).emit('turn-update', newTurn)
//   })

//   socket.on('disconnect', () => {
//     console.log('Kliens lecsatlakozott:', socket.id)
//   })
// })

// --- FONTOS: a szervert a http szerverrel indítsd! ---

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`)
// })

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

// dispose connection pool when exiting app
process.once('SIGTERM', () => {
  db.dispose().catch((ex) => {
    console.error(ex)
  })
})
