import z from 'zod'
import { DataCondition } from '../type'

export default class LtConditionPlugin implements DataCondition.Plugin<'lt'> {
  readonly op = 'lt'
  readonly label = '小于'

  check(
    condition: Partial<DataCondition.LtCondition<any>>,
  ): condition is DataCondition.LtCondition<any> {
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
      value: z.string().or(z.number()),
    })
  }
}
