import { TextFieldPlugin as _TextFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'
import { NCRUD } from '../type'

export default class TextFieldPlugin
  extends _TextFieldPlugin
  implements NCRUD.FieldPlugin<'text'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: NCRUD.FieldCreateConditionOption<'text', M>) {
    conditionPluginManager.create(
      builder,
      {
        ...condition,
        key: field.name,
      },
      ['isNull', 'isNotNull', 'eq', 'neq', 'like', 'notLike'],
    )
  }
}
