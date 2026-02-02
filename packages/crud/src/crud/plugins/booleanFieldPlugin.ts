import { DataCRUD } from '@shuttle-data/type'
import { BooleanFieldPlugin as _BooleanFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'

export default class BooleanFieldPlugin
  extends _BooleanFieldPlugin
  implements DataCRUD.Server.FieldPlugin<'boolean'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: DataCRUD.Server.FieldCreateConditionOption<'boolean', M>) {
    conditionPluginManager.create(
      builder,
      {
        ...condition,
        key: field.name,
      },
      this.getSupportConditionOps(),
    )
  }
}
