import z from 'zod'
import { DataCondition } from '../type'

export default class IsNullConditionPlugin implements DataCondition.Plugin<'isNull'> {
  readonly op = 'isNull'
  readonly label = '为空'

  check(
    condition: Partial<DataCondition.IsNullCondition<any>>,
  ): condition is DataCondition.IsNullCondition<any> {
    return !!condition.op && !!condition.key
  }

  getZod() {
    return z.object({
      op: z.literal(this.op),
      key: z.string(),
    })
  }
}
