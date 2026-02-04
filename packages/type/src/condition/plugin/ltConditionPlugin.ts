import { DataCondition } from '../type'

export default class LtConditionPlugin implements DataCondition.Plugin<'lt'> {
  readonly op = 'lt'
  readonly label = '小于'

  check(
    condition: Partial<DataCondition.LtCondition<any>>,
  ): condition is DataCondition.LtCondition<any> {
    return (
      !!condition.op &&
      !!condition.key &&
      condition.value !== undefined &&
      condition.value !== null
    )
  }
}
