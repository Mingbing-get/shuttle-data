import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class ContainsConditionPlugin implements NCRUD.ConditionPlugin<'contains'> {
  readonly op = 'contains'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.ContainsCondition<M>,
  ) {
    const factValue =
      Object.prototype.toString.call(condition.value) === '[object Object]'
        ? (condition.value as { _id: string })._id
        : (condition.value as string)

    builder.whereJsonSupersetOf(condition.key, [factValue])
  }
}
