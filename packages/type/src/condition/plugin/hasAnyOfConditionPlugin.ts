import z from 'zod'
import { DataCondition } from '../type'
import { withIdValueZod } from './utils'

export default class HasAnyOfConditionPlugin implements DataCondition.Plugin<'hasAnyOf'> {
  readonly op = 'hasAnyOf'
  readonly label = '包含任意'

  check(
    condition: Partial<DataCondition.HasAnyOfCondition<any>>,
  ): condition is DataCondition.HasAnyOfCondition<any> {
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
