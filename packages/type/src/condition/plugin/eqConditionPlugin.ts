import { DataCondition } from '../type'

export default class EqConditionPlugin implements DataCondition.Plugin<'eq'> {
  readonly op = 'eq'
  readonly label = '等于'
}
