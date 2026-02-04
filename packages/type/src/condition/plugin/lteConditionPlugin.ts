import { DataCondition } from '../type'

export default class LteConditionPlugin implements DataCondition.Plugin<'lte'> {
  readonly op = 'lte'
  readonly label = '小于等于'

  check(
    condition: Partial<DataCondition.LteCondition<any>>,
  ): condition is DataCondition.LteCondition<any> {
    return (
      !!condition.op &&
      !!condition.key &&
      condition.value !== undefined &&
      condition.value !== null
    )
  }
}
