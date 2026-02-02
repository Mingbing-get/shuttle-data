import { Knex } from 'knex'
import {
  DataCondition,
  NeqConditionPlugin as BaseNeqConditionPlugin,
} from '@shuttle-data/type'

export default class NeqConditionPlugin
  extends BaseNeqConditionPlugin
  implements DataCondition.Server.Plugin<'neq'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.NeqCondition<M>,
  ) {
    builder.where(condition.key, '!=', condition.value)
  }
}
