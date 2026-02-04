import { DataCondition } from '../type'

export default class EqConditionPlugin implements DataCondition.Plugin<'eq'> {
  readonly op = 'eq'
  readonly label = '等于'

  check(
    condition: Partial<DataCondition.EqCondition<any>>,
  ): condition is DataCondition.EqCondition<any> {
    return (
      !!condition.op &&
      !!condition.key &&
      condition.value !== undefined &&
      condition.value !== null
    )
  }
}
