import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class IsNotNullConditionPlugin implements NCRUD.ConditionPlugin<'isNotNull'> {
  readonly op = 'isNotNull'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.IsNotNullCondition<M>,
  ) {
    builder.whereNotNull(condition.key)
  }
}
