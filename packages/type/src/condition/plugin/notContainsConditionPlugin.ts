import { DataCondition } from '../type'

export default class NotContainsConditionPlugin implements DataCondition.Plugin<'notContains'> {
  readonly op = 'notContains'
  readonly label = '不包含'
}
