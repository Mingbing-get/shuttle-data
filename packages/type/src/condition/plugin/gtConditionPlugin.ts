import { DataCondition } from '../type'

export default class GtConditionPlugin implements DataCondition.Plugin<'gt'> {
  readonly op = 'gt'
  readonly label = '大于'

  check(
    condition: Partial<DataCondition.GtCondition<any>>,
  ): condition is DataCondition.GtCondition<any> {
    return (
      !!condition.op &&
      !!condition.key &&
      condition.value !== undefined &&
      condition.value !== null
    )
  }
}
