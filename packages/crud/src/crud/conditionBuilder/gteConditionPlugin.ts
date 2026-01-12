import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class GteConditionPlugin implements NCRUD.ConditionPlugin<'gte'> {
  readonly op = 'gte'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.GteCondition<M>,
  ) {
    builder.where(condition.key, '>=', condition.value)
  }
}
