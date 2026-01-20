import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

export default class IsTrueConditionPlugin implements DataCondition.Server
  .Plugin<'isTrue'> {
  readonly op = 'isTrue'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.IsTrueCondition<M>,
  ) {
    builder.where(condition.key, '=', true)
  }
}
