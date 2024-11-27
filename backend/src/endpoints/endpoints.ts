import Express from 'express'
import { userEndpoints } from './user'
import { lobbyEndpoints } from './lobby'
import { gameoptionsEndpoints } from './game-options'
import { boardgameEndpoints } from '../boardgames/endpoints'

export function loadEndpoints(app: Express.Express) {
  const allEndpoints = [...userEndpoints, ...lobbyEndpoints, ...gameoptionsEndpoints, ...boardgameEndpoints]
  allEndpoints.forEach((ep) => {
    switch (ep.endpointType) {
      case 'post':
        app.post('/api' + ep.path, ep.handler)
        break
      case 'get':
        app.get('/api' + ep.path, ep.handler)
        break
    }
  })
}
