import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

export default class GteConditionPlugin implements DataCondition.Server
  .Plugin<'gte'> {
  readonly op = 'gte'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.GteCondition<M>,
  ) {
    builder.where(condition.key, '>=', condition.value)
  }
}
