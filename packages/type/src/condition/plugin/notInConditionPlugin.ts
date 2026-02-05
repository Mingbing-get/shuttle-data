import z from 'zod'
import { DataCondition } from '../type'
import { withIdValueZod } from './utils'

export default class NotInConditionPlugin implements DataCondition.Plugin<'notIn'> {
  readonly op = 'notIn'
  readonly label = '不属于'

  check(
    condition: Partial<DataCondition.NotInCondition<any>>,
  ): condition is DataCondition.NotInCondition<any> {
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
