import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

export default class LteConditionPlugin implements DataCondition.Server
  .Plugin<'lte'> {
  readonly op = 'lte'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.LteCondition<M>,
  ) {
    builder.where(condition.key, '<=', condition.value)
  }
}
