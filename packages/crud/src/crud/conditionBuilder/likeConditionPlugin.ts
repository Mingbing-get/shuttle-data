import { Knex } from 'knex'
import {
  DataCondition,
  LikeConditionPlugin as BaseLikeConditionPlugin,
} from '@shuttle-data/type'

export default class LikeConditionPlugin
  extends BaseLikeConditionPlugin
  implements DataCondition.Server.Plugin<'like'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.LikeCondition<M>,
  ) {
    builder.whereILike(condition.key, `%${condition.value}%`)
  }
}
