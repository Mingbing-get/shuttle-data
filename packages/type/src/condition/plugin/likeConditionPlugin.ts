import { DataCondition } from '../type'

export default class LikeConditionPlugin implements DataCondition.Plugin<'like'> {
  readonly op = 'like'
  readonly label = '包含(字符串)'
}
