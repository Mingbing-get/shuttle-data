import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

export default class IsNullConditionPlugin implements DataCondition.Server
  .Plugin<'isNull'> {
  readonly op = 'isNull'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.IsNullCondition<M>,
  ) {
    builder.whereNull(condition.key)
  }
}
