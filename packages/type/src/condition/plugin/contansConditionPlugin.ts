import { DataCondition } from '../type'

export default class ContainsConditionPlugin implements DataCondition.Plugin<'contains'> {
  readonly op = 'contains'
  readonly label = '包含'

  check(
    condition: Partial<DataCondition.ContainsCondition<any>>,
  ): condition is DataCondition.ContainsCondition<any> {
    return (
      !!condition.op &&
      !!condition.key &&
      condition.value !== undefined &&
      condition.value !== null
    )
  }
}
