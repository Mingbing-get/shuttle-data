import { Knex } from 'knex'
import {
  DataCondition,
  ContainsConditionPlugin as BaseContainsConditionPlugin,
} from '@shuttle-data/type'

export default class ContainsConditionPlugin
  extends BaseContainsConditionPlugin
  implements DataCondition.Server.Plugin<'contains'>
{
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
