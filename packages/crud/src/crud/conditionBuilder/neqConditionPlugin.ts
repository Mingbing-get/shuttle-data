import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

export default class NeqConditionPlugin implements DataCondition.Server
  .Plugin<'neq'> {
  readonly op = 'neq'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.NeqCondition<M>,
  ) {
    builder.where(condition.key, '!=', condition.value)
  }
}
