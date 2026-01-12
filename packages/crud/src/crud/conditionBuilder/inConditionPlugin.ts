import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class InConditionPlugin implements NCRUD.ConditionPlugin<'in'> {
  readonly op = 'in'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.InCondition<M>,
  ) {
    const factValue = condition.value.map((v) => {
      return Object.prototype.toString.call(v) === '[object Object]'
        ? (v as { _id: string })._id
        : (v as string)
    })

    builder.whereIn(condition.key, factValue)
  }
}
