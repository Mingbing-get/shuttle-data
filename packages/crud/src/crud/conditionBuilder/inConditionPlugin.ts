import { Knex } from 'knex'
import {
  DataCondition,
  InConditionPlugin as BaseInConditionPlugin,
} from '@shuttle-data/type'

export default class InConditionPlugin
  extends BaseInConditionPlugin
  implements DataCondition.Server.Plugin<'in'>
{
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
