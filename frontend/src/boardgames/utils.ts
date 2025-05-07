import { playerOptions as kingdominoPlayerOptions } from './kingdomino/options/labels'

export const gameNames = [{ value: 'kingdomino', label: 'Kingdominó' }]

export const getPlayerOptions = (gameName: string) => {
  switch (gameName) {
    case 'kingdomino':
      return kingdominoPlayerOptions
    default:
      return {
        minPlayerOptions: [],
        maxPlayerOptions: [],
      }
  }
}
