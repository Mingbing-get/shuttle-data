import { DataCondition } from '../type'

export default class NeqConditionPlugin implements DataCondition.Plugin<'neq'> {
  readonly op = 'neq'
  readonly label = '不等于'

  check(
    condition: Partial<DataCondition.NeqCondition<any>>,
  ): condition is DataCondition.NeqCondition<any> {
    return (
      !!condition.op &&
      !!condition.key &&
      condition.value !== undefined &&
      condition.value !== null
    )
  }
}
