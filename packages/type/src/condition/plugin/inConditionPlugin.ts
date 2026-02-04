import { DataCondition } from '../type'

export default class InConditionPlugin implements DataCondition.Plugin<'in'> {
  readonly op = 'in'
  readonly label = '属于'

  check(
    condition: Partial<DataCondition.InCondition<any>>,
  ): condition is DataCondition.InCondition<any> {
    return !!condition.op && !!condition.key && !!condition.value?.length
  }
}
