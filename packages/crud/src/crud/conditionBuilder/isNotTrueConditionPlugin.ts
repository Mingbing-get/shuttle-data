import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class IsNotTrueConditionPlugin implements NCRUD.ConditionPlugin<'isNotTrue'> {
  readonly op = 'isNotTrue'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.IsNotTrueCondition<M>,
  ) {
    builder.where(condition.key, '<>', true)
  }
}
