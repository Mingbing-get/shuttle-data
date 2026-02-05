import z from 'zod'
import { DataCondition } from '../type'
import { withIdValueZod } from './utils'

export default class NotAnyOfConditionPlugin implements DataCondition.Plugin<'notAnyOf'> {
  readonly op = 'notAnyOf'
  readonly label = '不属于任意'

  check(
    condition: Partial<DataCondition.NotAnyOfCondition<any>>,
  ): condition is DataCondition.NotAnyOfCondition<any> {
    return !!condition.op && !!condition.key && !!condition.value?.length
  }

  getZod() {
    return z.object({
      op: z.literal(this.op),
      key: z.string(),
      value: z.array(withIdValueZod),
    })
  }
}
