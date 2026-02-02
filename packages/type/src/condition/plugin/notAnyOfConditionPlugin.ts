import { DataCondition } from '../type'

export default class NotAnyOfConditionPlugin implements DataCondition.Plugin<'notAnyOf'> {
  readonly op = 'notAnyOf'
  readonly label = '不属于任意'
}
