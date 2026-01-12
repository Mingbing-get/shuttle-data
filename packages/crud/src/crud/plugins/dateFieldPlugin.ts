import { DateFieldPlugin as _DateFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'
import { NCRUD } from '../type'

export default class DateFieldPlugin
  extends _DateFieldPlugin
  implements NCRUD.FieldPlugin<'date'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: NCRUD.FieldCreateConditionOption<'date', M>) {
    conditionPluginManager.create(
      builder,
      {
        ...condition,
        key: field.name,
      },
      [
        'isNull',
        'isNotNull',
        'eq',
        'neq',
        'gt',
        'lt',
        'gte',
        'lte',
        'in',
        'notIn',
      ],
    )
  }
}
