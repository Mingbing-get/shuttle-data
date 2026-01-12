import { BooleanFieldPlugin as _BooleanFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'
import { NCRUD } from '../type'

export default class BooleanFieldPlugin
  extends _BooleanFieldPlugin
  implements NCRUD.FieldPlugin<'boolean'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: NCRUD.FieldCreateConditionOption<'boolean', M>) {
    conditionPluginManager.create(
      builder,
      {
        ...condition,
        key: field.name,
      },
      ['isNull', 'isNotNull', 'isTrue', 'isNotTrue', 'eq', 'neq'],
    )
  }
}
