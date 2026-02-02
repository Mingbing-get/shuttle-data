import { DataCondition } from '../type'

export default class ContainsConditionPlugin implements DataCondition.Plugin<'contains'> {
  readonly op = 'contains'
  readonly label = '包含'
}
