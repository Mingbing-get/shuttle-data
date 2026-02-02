import { Knex } from 'knex'
import {
  DataCondition,
  NotLikeConditionPlugin as BaseNotLikeConditionPlugin,
} from '@shuttle-data/type'

export default class NotLikeConditionPlugin
  extends BaseNotLikeConditionPlugin
  implements DataCondition.Server.Plugin<'notLike'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.NotLikeCondition<M>,
  ) {
    builder.not.where((builder) => {
      builder.whereILike(condition.key, `%${condition.value}%`)
    })
  }
}
