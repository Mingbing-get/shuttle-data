import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

export default class LikeConditionPlugin implements DataCondition.Server
  .Plugin<'like'> {
  readonly op = 'like'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.LikeCondition<M>,
  ) {
    builder.whereILike(condition.key, `%${condition.value}%`)
  }
}
