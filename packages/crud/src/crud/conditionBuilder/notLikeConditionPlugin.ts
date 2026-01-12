import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class NotLikeConditionPlugin implements NCRUD.ConditionPlugin<'notLike'> {
  readonly op = 'notLike'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.NotLikeCondition<M>,
  ) {
    builder.not.where((builder) => {
      builder.whereILike(condition.key, `%${condition.value}%`)
    })
  }
}
