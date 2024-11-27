import { kingdomino_optionsTable, db, game_optionsTable } from '../../../database/database'
import { GameOptions } from '../../../database/generated'
import { OptionDescriptor } from '../../../types'

export const gameOptionsDescriptor: OptionDescriptor[] = [
  {
    optionName: 'big_kingdom_enabled',
    optionDisplayName: '7x7-es királyság (csak 2 személyes módban)',
    optionType: 'boolean',
  },
  {
    optionName: 'complete_bonus',
    optionDisplayName: 'Bónuszpont befejezett királyágért',
    optionType: 'boolean',
  },
  {
    optionName: 'middle_bonus',
    optionDisplayName: 'Bónuszpont középen lévő kastélyért',
    optionType: 'boolean',
  },
]

export const createGameOptions = async (req: any) => {
  const { big_kingdom_enabled, middle_bonus, complete_bonus } = req.body
  const newOptions = await kingdomino_optionsTable(db).insert({
    big_kingdom_enabled,
    complete_bonus,
    middle_bonus,
  })
  return newOptions[0]?.id
}

export const deleteGameOptions = async (gameOptionsId: GameOptions['id']) => {
  const gameOptions = await game_optionsTable(db).findOne({ id: gameOptionsId })
  if (gameOptions?.kingdomino_options) {
    await kingdomino_optionsTable(db).delete({ id: gameOptions.kingdomino_options })
  }
}
