import { DataCRUD } from '@shuttle-data/type'
import { DoubleFieldPlugin as _DoubleFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'

export default class DoubleFieldPlugin
  extends _DoubleFieldPlugin
  implements DataCRUD.Server.FieldPlugin<'double'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: DataCRUD.Server.FieldCreateConditionOption<'double', M>) {
    conditionPluginManager.create(
      builder,
      {
        ...condition,
        key: field.name,
      },
      this.getSupportConditionOps(),
    )
  }

  toDb({ values, field }: DataCRUD.Server.FieldToDbOption<'double', number>) {
    const min = field.extra?.min
    const max = field.extra?.max
    const decimal = field.extra?.decimal

    if (min !== undefined || max !== undefined || decimal !== undefined) {
      return values.map((v) => {
        if (v !== undefined && v !== null) {
          if (min !== undefined && v < min) {
            throw new Error(
              `Double field ${field.label || field.apiName} min value is ${min}`,
            )
          }

          if (max !== undefined && v > max) {
            throw new Error(
              `Double field ${field.label || field.apiName} max value is ${max}`,
            )
          }

          if (decimal !== undefined) {
            v = Number(v.toFixed(decimal))
          }
        }

        return v
      })
    }

    return values
  }
}
