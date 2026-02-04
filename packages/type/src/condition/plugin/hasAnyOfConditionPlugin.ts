import { DataCondition } from '../type'

export default class HasAnyOfConditionPlugin implements DataCondition.Plugin<'hasAnyOf'> {
  readonly op = 'hasAnyOf'
  readonly label = '包含任意'

  check(
    condition: Partial<DataCondition.HasAnyOfCondition<any>>,
  ): condition is DataCondition.HasAnyOfCondition<any> {
    return !!condition.op && !!condition.key && !!condition.value?.length
  }
}
