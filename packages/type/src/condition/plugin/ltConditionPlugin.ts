import { DataCondition } from '../type'

export default class LtConditionPlugin implements DataCondition.Plugin<'lt'> {
  readonly op = 'lt'
  readonly label = '小于'
}
