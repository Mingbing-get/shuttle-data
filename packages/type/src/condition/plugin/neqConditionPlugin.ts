import z from 'zod'
import { DataCondition } from '../type'
import { withIdValueZod } from './utils'

export default class NeqConditionPlugin implements DataCondition.Plugin<'neq'> {
  readonly op = 'neq'
  readonly label = '不等于'

  check(
    condition: Partial<DataCondition.NeqCondition<any>>,
  ): condition is DataCondition.NeqCondition<any> {
    return (
      !!condition.op &&
      !!condition.key &&
      condition.value !== undefined &&
      condition.value !== null
    )
  }

  getZod() {
    return z.object({
      op: z.literal(this.op),
      key: z.string(),
      value: withIdValueZod,
    })
  }
}
