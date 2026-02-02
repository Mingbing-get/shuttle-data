import { DataCondition } from '../type'

export default class InConditionPlugin implements DataCondition.Plugin<'in'> {
  readonly op = 'in'
  readonly label = '包含'
}
