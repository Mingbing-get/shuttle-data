import { DataCondition } from '../type'

export default class IsNullConditionPlugin implements DataCondition.Plugin<'isNull'> {
  readonly op = 'isNull'
  readonly label = '为空'
}
