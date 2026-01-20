import { DataCRUD } from '@shuttle-data/type'
import { NumberFieldPlugin as _NumberFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'

export default class NumberFieldPlugin
  extends _NumberFieldPlugin
  implements DataCRUD.Server.FieldPlugin<'number'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: DataCRUD.Server.FieldCreateConditionOption<'number', M>) {
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

  toDb({
    values,
    field,
  }: DataCRUD.Server.FieldToDbOption<'number', number | undefined>) {
    const min = field.extra?.min
    const max = field.extra?.max
    const func = field.extra?.func || 'round'

    const funcFn = {
      floor: Math.floor,
      round: Math.round,
      ceil: Math.ceil,
    }

    return values.map((v) => {
      if (v !== undefined && v !== null) {
        if (min !== undefined && v < min) {
          throw new Error(
            `Number field ${field.label || field.apiName} min value is ${min}`,
          )
        }
        if (max !== undefined && v > max) {
          throw new Error(
            `Number field ${field.label || field.apiName} max value is ${max}`,
          )
        }

        return funcFn[func](v)
      }

      return v
    })
  }
}
