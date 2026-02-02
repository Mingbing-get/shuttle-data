import { DataCondition } from '../type'

export default class NeqConditionPlugin implements DataCondition.Plugin<'neq'> {
  readonly op = 'neq'
  readonly label = '不等于'
}
