import z from 'zod'
import { DataCondition } from '../type'
import { withIdValueZod } from './utils'

export default class NotContainsConditionPlugin implements DataCondition.Plugin<'notContains'> {
  readonly op = 'notContains'
  readonly label = '不包含'

  check(
    condition: Partial<DataCondition.NotContainsCondition<any>>,
  ): condition is DataCondition.NotContainsCondition<any> {
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
