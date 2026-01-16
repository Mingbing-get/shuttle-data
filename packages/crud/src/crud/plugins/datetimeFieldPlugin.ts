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

  compare({
    value1,
    value2,
  }: NCRUD.FieldCompareOption<'datetime', Date | string>) {
    const v1 = value1 instanceof Date ? value1.toISOString() : value1

    const v2 = value2 instanceof Date ? value2.toISOString() : value2

    return v1 === v2
  }
}
