import { DataModel } from '@shuttle-data/type'

import DateFormInputRender, {
  DateInputRenderExtraProps,
} from './formInputRender'

export interface DateConditionInputRenderProps
  extends
    DataModel.Render.ConditionInputRenderProps<'date', string>,
    DateInputRenderExtraProps {}

export default function DateConditionInputRender({
  op,
  ...inputProps
}: DateConditionInputRenderProps) {
  if (
    op === 'eq' ||
    op === 'neq' ||
    op === 'gt' ||
    op === 'lt' ||
    op === 'gte' ||
    op === 'lte'
  ) {
    return <DateFormInputRender {...inputProps} />
  }

  return null
}
