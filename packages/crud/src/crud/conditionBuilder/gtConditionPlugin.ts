import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class GtConditionPlugin implements NCRUD.ConditionPlugin<'gt'> {
  readonly op = 'gt'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.GtCondition<M>,
  ) {
    builder.where(condition.key, '>', condition.value)
  }
}
