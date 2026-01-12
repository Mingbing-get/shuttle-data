import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class LikeConditionPlugin implements NCRUD.ConditionPlugin<'like'> {
  readonly op = 'like'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.LikeCondition<M>,
  ) {
    builder.whereILike(condition.key, `%${condition.value}%`)
  }
}
