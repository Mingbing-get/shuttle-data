import { Knex } from 'knex'
import {
  DataCondition,
  NotContainsConditionPlugin as BaseNotContainsConditionPlugin,
} from '@shuttle-data/type'

export default class NotContainsConditionPlugin
  extends BaseNotContainsConditionPlugin
  implements DataCondition.Server.Plugin<'notContains'>
{
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
