import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

export default class GtConditionPlugin implements DataCondition.Server
  .Plugin<'gt'> {
  readonly op = 'gt'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.GtCondition<M>,
  ) {
    builder.where(condition.key, '>', condition.value)
  }
}
