import { Knex } from 'knex'
import { DataCondition } from '@shuttle-data/type'

export default class NotAnyOfConditionPlugin implements DataCondition.Server
  .Plugin<'notAnyOf'> {
  readonly op = 'notAnyOf'

  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.NotAnyOfCondition<M>,
  ) {
    if (condition.value.length === 0) return

    const factValue = condition.value.map((v) => {
      return Object.prototype.toString.call(v) === '[object Object]'
        ? (v as { _id: string })._id
        : (v as string)
    })

    builder.where((builder) => {
      for (let i = 0; i < factValue.length; i++) {
        builder.and.whereJsonNotSupersetOf(condition.key, [factValue[i]])
      }
    })
  }
}
