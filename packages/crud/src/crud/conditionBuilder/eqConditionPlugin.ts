import { Knex } from 'knex'
import {
  DataCondition,
  EqConditionPlugin as BaseEqConditionPlugin,
} from '@shuttle-data/type'

export default class EqConditionPlugin
  extends BaseEqConditionPlugin
  implements DataCondition.Server.Plugin<'eq'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.EqCondition<M>,
  ) {
    builder.where(condition.key, '=', condition.value)
  }
}
