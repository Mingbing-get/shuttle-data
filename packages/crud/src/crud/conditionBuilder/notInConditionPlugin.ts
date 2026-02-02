import { Knex } from 'knex'
import {
  DataCondition,
  NotInConditionPlugin as BaseNotInConditionPlugin,
} from '@shuttle-data/type'

export default class NotInConditionPlugin
  extends BaseNotInConditionPlugin
  implements DataCondition.Server.Plugin<'notIn'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.NotInCondition<M>,
  ) {
    const factValue = condition.value.map((v) => {
      return Object.prototype.toString.call(v) === '[object Object]'
        ? (v as { _id: string })._id
        : (v as string)
    })

    builder.whereNotIn(condition.key, factValue)
  }
}
