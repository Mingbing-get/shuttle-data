import z from 'zod'
import { DataCondition } from '../type'

export default class LikeConditionPlugin implements DataCondition.Plugin<'like'> {
  readonly op = 'like'
  readonly label = '包含(字符串)'

  check(
    condition: Partial<DataCondition.LikeCondition<any>>,
  ): condition is DataCondition.LikeCondition<any> {
    return !!condition.op && !!condition.key && !!condition.value
  }

  getZod() {
    return z.object({
      op: z.literal(this.op),
      key: z.string(),
      value: z.string().describe('The value does not need to contain %, % will be automatically added'),
    })
  }
}
