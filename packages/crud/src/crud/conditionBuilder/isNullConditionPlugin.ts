import { Knex } from 'knex'
import {
  DataCondition,
  IsNullConditionPlugin as BaseIsNullConditionPlugin,
} from '@shuttle-data/type'

export default class IsNullConditionPlugin
  extends BaseIsNullConditionPlugin
  implements DataCondition.Server.Plugin<'isNull'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.IsNullCondition<M>,
  ) {
    builder.whereNull(condition.key)
  }
}
