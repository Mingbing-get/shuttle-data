import { DataCondition } from '../type'

export default class NotInConditionPlugin implements DataCondition.Plugin<'notIn'> {
  readonly op = 'notIn'
  readonly label = '不属于'

  check(
    condition: Partial<DataCondition.NotInCondition<any>>,
  ): condition is DataCondition.NotInCondition<any> {
    return !!condition.op && !!condition.key && !!condition.value?.length
  }
}
