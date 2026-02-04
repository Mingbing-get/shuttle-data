import { DataCondition } from '../type'

export default class IsNotNullConditionPlugin implements DataCondition.Plugin<'isNotNull'> {
  readonly op = 'isNotNull'
  readonly label = '不为空'

  check(
    condition: Partial<DataCondition.IsNotNullCondition<any>>,
  ): condition is DataCondition.IsNotNullCondition<any> {
    return !!condition.op && !!condition.key
  }
}
