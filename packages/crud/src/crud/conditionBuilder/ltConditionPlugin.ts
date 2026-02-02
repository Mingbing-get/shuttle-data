import { Knex } from 'knex'
import {
  DataCondition,
  LtConditionPlugin as BaseLtConditionPlugin,
} from '@shuttle-data/type'

export default class LtConditionPlugin
  extends BaseLtConditionPlugin
  implements DataCondition.Server.Plugin<'lt'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.LtCondition<M>,
  ) {
    builder.where(condition.key, '<', condition.value)
  }
}
