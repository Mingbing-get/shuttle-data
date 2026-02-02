import { DataCondition } from '../type'

export default class NotInConditionPlugin implements DataCondition.Plugin<'notIn'> {
  readonly op = 'notIn'
  readonly label = '不属于'
}
