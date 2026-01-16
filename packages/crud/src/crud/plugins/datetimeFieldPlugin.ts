import { DatetimeFieldPlugin as _DatetimeFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'
import { NCRUD } from '../type'

export default class DatetimeFieldPlugin
  extends _DatetimeFieldPlugin
  implements NCRUD.FieldPlugin<'datetime'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: NCRUD.FieldCreateConditionOption<'datetime', M>) {
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

  toDb({ values }: NCRUD.FieldToDbOption<'datetime', Date | string>) {
    return values.map((value) =>
      value instanceof Date ? value.toISOString() : value,
    )
  }
}
