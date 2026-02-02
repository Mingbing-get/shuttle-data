import { Knex } from 'knex'
import {
  DataCondition,
  IsNotTrueConditionPlugin as BaseIsNotTrueConditionPlugin,
} from '@shuttle-data/type'

export default class IsNotTrueConditionPlugin
  extends BaseIsNotTrueConditionPlugin
  implements DataCondition.Server.Plugin<'isNotTrue'>
{
  create<M extends Record<string, any>>(
    builder: Knex.QueryBuilder,
    condition: DataCondition.IsNotTrueCondition<M>,
  ) {
    builder.where(condition.key, '<>', true)
  }
}
