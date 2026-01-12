import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class EqConditionPlugin implements NCRUD.ConditionPlugin<'eq'> {
  readonly op = 'eq'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.EqCondition<M>,
  ) {
    builder.where(condition.key, '=', condition.value)
  }
}
