import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class NotContainsConditionPlugin implements NCRUD.ConditionPlugin<'notContains'> {
  readonly op = 'notContains'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.NotContainsCondition<M>,
  ) {
    const factValue =
      Object.prototype.toString.call(condition.value) === '[object Object]'
        ? (condition.value as { _id: string })._id
        : (condition.value as string)

    builder.whereJsonNotSupersetOf(condition.key, [factValue])
  }
}
