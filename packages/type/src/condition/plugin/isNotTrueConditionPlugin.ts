import z from 'zod'
import { DataCondition } from '../type'

export default class IsNotTrueConditionPlugin implements DataCondition.Plugin<'isNotTrue'> {
  readonly op = 'isNotTrue'
  readonly label = '不为真'

  check(
    condition: Partial<DataCondition.IsNotTrueCondition<any>>,
  ): condition is DataCondition.IsNotTrueCondition<any> {
    return !!condition.op && !!condition.key
  }

  getZod() {
    return z.object({
      op: z.literal(this.op),
      key: z.string(),
    })
  }
}
