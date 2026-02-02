import { DataCondition } from '../type'

export default class LteConditionPlugin implements DataCondition.Plugin<'lte'> {
  readonly op = 'lte'
  readonly label = '小于等于'
}
