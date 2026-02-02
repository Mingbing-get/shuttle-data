import { Knex } from 'knex'
import {
  DataCondition,
  GtConditionPlugin as BaseGtConditionPlugin,
} from '@shuttle-data/type'

export default class GtConditionPlugin
  extends BaseGtConditionPlugin
  implements DataCondition.Server.Plugin<'gt'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.GtCondition<M>,
  ) {
    builder.where(condition.key, '>', condition.value)
  }
}
