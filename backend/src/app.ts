import express from 'express'
import cors from 'cors'
import { loadEndpoints } from './endpoints/endpoints'
import { errorHandler } from './utils'
import { db } from './database/database'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

loadEndpoints(app)

app.get('/', (req, res) => {
  res.send({ message: 'Hello, TypeScript Node Express!' })
})

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

// dispose connection pool when exiting app
process.once('SIGTERM', () => {
  db.dispose().catch((ex) => {
    console.error(ex)
  })
})
