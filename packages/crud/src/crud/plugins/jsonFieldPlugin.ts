import { DataCRUD } from '@shuttle-data/type'
import { JsonFieldPlugin as _JsonFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'

export default class JsonFieldPlugin
  extends _JsonFieldPlugin
  implements DataCRUD.Server.FieldPlugin<'json'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: DataCRUD.Server.FieldCreateConditionOption<'json', M>) {
    conditionPluginManager.create(
      builder,
      {
        ...condition,
        key: field.name,
      },
      this.getSupportConditionOps(),
    )
  }

  toDb({ values }: DataCRUD.Server.FieldToDbOption<'json', any>) {
    if (!values?.length) return values

    return values.map((value) => {
      if (typeof value === 'string') {
        return value
      }
      return JSON.stringify(value)
    })
  }

  toOutput({ values }: DataCRUD.Server.FieldToOutputOption<'json', any>) {
    if (!values?.length) return values

    return values.map((value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch (error) {
          return value
        }
      }
      return value
    })
  }

  compare({ value1, value2 }: DataCRUD.Server.FieldCompareOption<'json', any>) {
    const v1 =
      !!value1 && typeof value1 !== 'string' ? JSON.stringify(value1) : value1
    const v2 =
      !!value2 && typeof value2 !== 'string' ? JSON.stringify(value2) : value2

    return v1 === v2
  }
}
