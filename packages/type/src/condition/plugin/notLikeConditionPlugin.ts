import { DataCondition } from '../type'

export default class NotLikeConditionPlugin implements DataCondition.Plugin<'notLike'> {
  readonly op = 'notLike'
  readonly label = '不包含(字符串)'

  check(
    condition: Partial<DataCondition.NotLikeCondition<any>>,
  ): condition is DataCondition.NotLikeCondition<any> {
    return !!condition.op && !!condition.key && !!condition.value
  }
}
