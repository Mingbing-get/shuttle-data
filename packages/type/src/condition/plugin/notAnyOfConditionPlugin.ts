import { DataCondition } from '../type'

export default class NotAnyOfConditionPlugin implements DataCondition.Plugin<'notAnyOf'> {
  readonly op = 'notAnyOf'
  readonly label = '不属于任意'

  check(
    condition: Partial<DataCondition.NotAnyOfCondition<any>>,
  ): condition is DataCondition.NotAnyOfCondition<any> {
    return !!condition.op && !!condition.key && !!condition.value?.length
  }
}
