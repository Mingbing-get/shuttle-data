import z from 'zod'
import { DataCondition } from '../type'
import { withIdValueZod } from './utils'

export default class InConditionPlugin implements DataCondition.Plugin<'in'> {
  readonly op = 'in'
  readonly label = '属于'

  check(
    condition: Partial<DataCondition.InCondition<any>>,
  ): condition is DataCondition.InCondition<any> {
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
