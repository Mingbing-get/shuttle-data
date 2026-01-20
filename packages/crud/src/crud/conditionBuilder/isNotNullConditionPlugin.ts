import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

export default class IsNotNullConditionPlugin implements DataCondition.Server
  .Plugin<'isNotNull'> {
  readonly op = 'isNotNull'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.IsNotNullCondition<M>,
  ) {
    builder.whereNotNull(condition.key)
  }
}
