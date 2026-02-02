import { DataCondition } from '../type'

export default class GtConditionPlugin implements DataCondition.Plugin<'gt'> {
  readonly op = 'gt'
  readonly label = '大于'
}
