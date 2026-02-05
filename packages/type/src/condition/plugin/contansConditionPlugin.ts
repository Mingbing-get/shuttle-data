import z from 'zod'
import { withIdValueZod } from './utils'
import { DataCondition } from '../type'

export default class ContainsConditionPlugin implements DataCondition.Plugin<'contains'> {
  readonly op = 'contains'
  readonly label = '包含'

  check(
    condition: Partial<DataCondition.ContainsCondition<any>>,
  ): condition is DataCondition.ContainsCondition<any> {
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
