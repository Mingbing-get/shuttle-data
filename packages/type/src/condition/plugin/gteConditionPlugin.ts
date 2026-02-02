import { DataCondition } from '../type'

export default class GteConditionPlugin implements DataCondition.Plugin<'gte'> {
  readonly op = 'gte'
  readonly label = '大于等于'
}
