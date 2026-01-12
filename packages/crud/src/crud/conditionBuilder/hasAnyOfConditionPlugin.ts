import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

import { NCRUD } from '../type'

export default class HasAnyOfConditionPlugin implements NCRUD.ConditionPlugin<'hasAnyOf'> {
  readonly op = 'hasAnyOf'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.HasAnyOfCondition<M>,
  ) {
    if (condition.value.length === 0) return

    const factValue = condition.value.map((v) => {
      return Object.prototype.toString.call(v) === '[object Object]'
        ? (v as { _id: string })._id
        : (v as string)
    })

    builder.where((builder) => {
      for (let i = 0; i < factValue.length; i++) {
        builder.or.whereJsonSupersetOf(condition.key, [factValue[i]])
      }
    })
  }
}
