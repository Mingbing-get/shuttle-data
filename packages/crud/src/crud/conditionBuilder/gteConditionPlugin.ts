import { Knex } from 'knex'
import {
  DataCondition,
  GteConditionPlugin as BaseGteConditionPlugin,
} from '@shuttle-data/type'

export default class GteConditionPlugin
  extends BaseGteConditionPlugin
  implements DataCondition.Server.Plugin<'gte'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.GteCondition<M>,
  ) {
    builder.where(condition.key, '>=', condition.value)
  }
}
