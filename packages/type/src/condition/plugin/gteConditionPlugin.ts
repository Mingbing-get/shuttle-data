import { DataCondition } from '../type'

export default class GteConditionPlugin implements DataCondition.Plugin<'gte'> {
  readonly op = 'gte'
  readonly label = '大于等于'

  check(
    condition: Partial<DataCondition.GteCondition<any>>,
  ): condition is DataCondition.GteCondition<any> {
    return (
      !!condition.op &&
      !!condition.key &&
      condition.value !== undefined &&
      condition.value !== null
    )
  }
}
