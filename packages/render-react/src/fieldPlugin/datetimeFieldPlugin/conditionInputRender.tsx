import { DataModel } from '@shuttle-data/type'

import DateTimeFormInputRender, {
  DateTimeInputRenderExtraProps,
} from './formInputRender'

export interface DateTimeConditionInputRenderProps
  extends
    DataModel.Render.ConditionInputRenderProps<'datetime', string>,
    DateTimeInputRenderExtraProps {}

export default function DateTimeConditionInputRender({
  op,
  ...inputProps
}: DateTimeConditionInputRenderProps) {
  if (
    op === 'eq' ||
    op === 'neq' ||
    op === 'gt' ||
    op === 'lt' ||
    op === 'gte' ||
    op === 'lte'
  ) {
    return <DateTimeFormInputRender {...inputProps} />
  }

  return null
}
