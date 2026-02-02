import { DataCondition } from '../type'

export default class IsNotNullConditionPlugin implements DataCondition.Plugin<'isNotNull'> {
  readonly op = 'isNotNull'
  readonly label = '不为空'
}
