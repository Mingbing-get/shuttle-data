import { DataCRUD } from '@shuttle-data/type'
import { StringFieldPlugin as _StringFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'

export default class StringFieldPlugin
  extends _StringFieldPlugin
  implements DataCRUD.Server.FieldPlugin<'string'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: DataCRUD.Server.FieldCreateConditionOption<'string', M>) {
    conditionPluginManager.create(
      builder,
      {
        ...condition,
        key: field.name,
      },
      ['isNull', 'isNotNull', 'eq', 'neq', 'like', 'notLike', 'in', 'notIn'],
    )
  }

  async toDb({
    values,
    field,
  }: DataCRUD.Server.FieldToDbOption<'string', string | undefined>) {
    const maxLength = field.extra?.maxLength
    if (maxLength) {
      values.forEach((v) => {
        if (v && v.length > maxLength) {
          throw new Error(
            `String field ${field.label || field.apiName} max length is ${maxLength}`,
          )
        }
      })
    }

    return values
  }
}
