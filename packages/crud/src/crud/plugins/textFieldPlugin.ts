import { DataCRUD } from '@shuttle-data/type'
import { TextFieldPlugin as _TextFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'

export default class TextFieldPlugin
  extends _TextFieldPlugin
  implements DataCRUD.Server.FieldPlugin<'text'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: DataCRUD.Server.FieldCreateConditionOption<'text', M>) {
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
