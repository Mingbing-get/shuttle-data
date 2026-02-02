import { Knex } from 'knex'
import {
  DataCondition,
  IsNotNullConditionPlugin as BaseIsNotNullConditionPlugin,
} from '@shuttle-data/type'

export default class IsNotNullConditionPlugin
  extends BaseIsNotNullConditionPlugin
  implements DataCondition.Server.Plugin<'isNotNull'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.IsNotNullCondition<M>,
  ) {
    builder.whereNotNull(condition.key)
  }
}
