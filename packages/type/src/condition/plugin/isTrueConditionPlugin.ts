import { DataCondition } from '../type'

export default class IsTrueConditionPlugin implements DataCondition.Plugin<'isTrue'> {
  readonly op = 'isTrue'
  readonly label = '为真'

  check(
    condition: Partial<DataCondition.IsTrueCondition<any>>,
  ): condition is DataCondition.IsTrueCondition<any> {
    return !!condition.op && !!condition.key
  }
}
