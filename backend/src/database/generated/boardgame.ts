/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: BFJ4ayUGwgGym1ZdO/4buStSTNcxwmWqg/PU7j6wjOK4XPnzm7UDaydgApEkmYqquyt2oaJowYRYDLtp6BCG9Q==
 */

/* eslint-disable */
// tslint:disable

import Kingdomino from './kingdomino'

interface Boardgame {
  game_name: string
  /**
   * @default nextval('boardgame_id_seq'::regclass)
   */
  id: number & {readonly __brand?: 'boardgame_id'}
  kingdomino: (Kingdomino['id']) | null
}
export default Boardgame;

interface Boardgame_InsertParameters {
  game_name: string
  /**
   * @default nextval('boardgame_id_seq'::regclass)
   */
  id?: number & {readonly __brand?: 'boardgame_id'}
  kingdomino?: (Kingdomino['id']) | null
}
export type {Boardgame_InsertParameters}
