import { DataCondition } from '../type'

export default class NotLikeConditionPlugin implements DataCondition.Plugin<'notLike'> {
  readonly op = 'notLike'
  readonly label = '不包含(字符串)'
}
