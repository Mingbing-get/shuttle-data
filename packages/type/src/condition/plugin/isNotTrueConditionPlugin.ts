import { DataCondition } from '../type'

export default class IsNotTrueConditionPlugin implements DataCondition.Plugin<'isNotTrue'> {
  readonly op = 'isNotTrue'
  readonly label = '不为真'
}
