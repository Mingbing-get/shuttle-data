import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class LtConditionPlugin implements NCRUD.ConditionPlugin<'lt'> {
  readonly op = 'lt'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.LtCondition<M>,
  ) {
    builder.where(condition.key, '<', condition.value)
  }
}
