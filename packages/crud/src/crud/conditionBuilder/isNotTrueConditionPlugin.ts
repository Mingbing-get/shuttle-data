import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

export default class IsNotTrueConditionPlugin implements DataCondition.Server
  .Plugin<'isNotTrue'> {
  readonly op = 'isNotTrue'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.IsNotTrueCondition<M>,
  ) {
    builder.where(condition.key, '<>', true)
  }
}
