import { Boardgame, Lobby } from '../../database/generated'
import { deleteGame, createAndInitBoardGame } from './game'
import {
  createGameOptions as cGO,
  deleteGameOptions,
  gameOptionsDescriptor as gOD,
} from './game-options'

export namespace Kingdomino {
  export const gameOptionsDescriptor = gOD
  export const createGameOptions = cGO

  export async function handleLobbyDeletion(lobby: Lobby) {
    if (lobby.game_options) {
      await deleteGameOptions(lobby.game_options)
    }
    if (lobby.game) {
      await deleteGame(lobby.game)
    }
  }

  export async function createBoardGame(lobby: Lobby): Promise<Boardgame['id']> {
    return await createAndInitBoardGame(lobby)
  }
}
