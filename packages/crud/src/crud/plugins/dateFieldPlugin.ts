import { DataCRUD } from '@shuttle-data/type'
import { DateFieldPlugin as _DateFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'

export default class DateFieldPlugin
  extends _DateFieldPlugin
  implements DataCRUD.Server.FieldPlugin<'date'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: DataCRUD.Server.FieldCreateConditionOption<'date', M>) {
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
