import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class NeqConditionPlugin implements NCRUD.ConditionPlugin<'neq'> {
  readonly op = 'neq'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.NeqCondition<M>,
  ) {
    builder.where(condition.key, '!=', condition.value)
  }
}
