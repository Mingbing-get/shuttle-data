import z from 'zod'
import { withIdValueZod } from './utils'
import { DataCondition } from '../type'

export default class EqConditionPlugin implements DataCondition.Plugin<'eq'> {
  readonly op = 'eq'
  readonly label = '等于'

  check(
    condition: Partial<DataCondition.EqCondition<any>>,
  ): condition is DataCondition.EqCondition<any> {
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
