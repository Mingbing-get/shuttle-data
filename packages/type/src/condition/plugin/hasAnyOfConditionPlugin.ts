import { DataCondition } from '../type'

export default class HasAnyOfConditionPlugin implements DataCondition.Plugin<'hasAnyOf'> {
  readonly op = 'hasAnyOf'
  readonly label = '包含任意'
}
