import { Endpoint } from '../../../types'
import { dominoEndpoints } from './domino'
import { kingdomEndpoints } from './kingdom'
import { kingdominoEndpoints as kdEndpoints } from './kingdomino'

export const kingdominoEndpoints: Endpoint[] = [...kdEndpoints, ...kingdomEndpoints, ...dominoEndpoints].map(
  (ep) => ({
    endpointType: ep.endpointType,
    handler: ep.handler,
    path: '/kingdomino' + ep.path,
  }),
)
