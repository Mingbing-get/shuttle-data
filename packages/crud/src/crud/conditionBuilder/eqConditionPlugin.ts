import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

export default class EqConditionPlugin implements DataCondition.Server
  .Plugin<'eq'> {
  readonly op = 'eq'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.EqCondition<M>,
  ) {
    builder.where(condition.key, '=', condition.value)
  }
}
