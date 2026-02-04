import { DataCondition } from '../type'

export default class NotContainsConditionPlugin implements DataCondition.Plugin<'notContains'> {
  readonly op = 'notContains'
  readonly label = '不包含'

  check(
    condition: Partial<DataCondition.NotContainsCondition<any>>,
  ): condition is DataCondition.NotContainsCondition<any> {
    return (
      !!condition.op &&
      !!condition.key &&
      condition.value !== undefined &&
      condition.value !== null
    )
  }
}
