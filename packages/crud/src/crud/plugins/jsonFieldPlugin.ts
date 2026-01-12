import { JsonFieldPlugin as _JsonFieldPlugin } from '@shuttle-data/schema'

import conditionPluginManager from '../conditionBuilder'
import { NCRUD } from '../type'

export default class JsonFieldPlugin
  extends _JsonFieldPlugin
  implements NCRUD.FieldPlugin<'json'>
{
  createCondition<M extends Record<string, any>>({
    builder,
    field,
    condition,
  }: NCRUD.FieldCreateConditionOption<'json', M>) {
    conditionPluginManager.create(
      builder,
      {
        ...condition,
        key: field.name,
      },
      ['isNull', 'isNotNull'],
    )
  }
}
