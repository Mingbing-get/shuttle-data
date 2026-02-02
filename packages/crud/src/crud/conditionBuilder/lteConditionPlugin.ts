import { Knex } from 'knex'
import {
  DataCondition,
  LteConditionPlugin as BaseLteConditionPlugin,
} from '@shuttle-data/type'

export default class LteConditionPlugin
  extends BaseLteConditionPlugin
  implements DataCondition.Server.Plugin<'lte'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.LteCondition<M>,
  ) {
    builder.where(condition.key, '<=', condition.value)
  }
}
