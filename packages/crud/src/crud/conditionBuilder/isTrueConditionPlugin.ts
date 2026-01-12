import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class IsTrueConditionPlugin implements NCRUD.ConditionPlugin<'isTrue'> {
  readonly op = 'isTrue'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.IsTrueCondition<M>,
  ) {
    builder.where(condition.key, '=', true)
  }
}
