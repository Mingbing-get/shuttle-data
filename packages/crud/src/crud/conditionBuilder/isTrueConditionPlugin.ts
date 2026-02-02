import { Knex } from 'knex'
import {
  DataCondition,
  IsTrueConditionPlugin as BaseIsTrueConditionPlugin,
} from '@shuttle-data/type'

export default class IsTrueConditionPlugin
  extends BaseIsTrueConditionPlugin
  implements DataCondition.Server.Plugin<'isTrue'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.IsTrueCondition<M>,
  ) {
    builder.where(condition.key, '=', true)
  }
}
