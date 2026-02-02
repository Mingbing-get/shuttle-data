import { DataCondition } from '../type'

export default class IsTrueConditionPlugin implements DataCondition.Plugin<'isTrue'> {
  readonly op = 'isTrue'
  readonly label = '为真'
}
