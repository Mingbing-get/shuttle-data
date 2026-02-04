import { useCallback } from 'react'
import { DatePicker } from 'antd'
import { DataModel } from '@shuttle-data/type'
import dayjs, { Dayjs } from 'dayjs'

import DateFormInputRender, {
  DateInputRenderExtraProps,
} from './formInputRender'

export interface DateConditionInputRenderProps
  extends
    DataModel.Render.ConditionInputRenderProps<'date', string | string[]>,
    DateInputRenderExtraProps {}

export default function DateConditionInputRender({
  op,
  value,
  onChange,
  ...inputProps
}: DateConditionInputRenderProps) {
  const handleMutipleChange = useCallback(
    (dates?: Dayjs[]) => {
      if (!dates) {
        onChange?.(undefined)
        return
      }

      onChange?.(dates.map((date) => dayjs(date).format('YYYY-MM-DD')))
    },
    [onChange],
  )

  if (
    op === 'eq' ||
    op === 'neq' ||
    op === 'gt' ||
    op === 'lt' ||
    op === 'gte' ||
    op === 'lte'
  ) {
    return (
      <DateFormInputRender
        {...inputProps}
        value={value as any}
        onChange={onChange}
      />
    )
  }

  if (op === 'in' || op === 'notIn') {
    return (
      <DatePicker
        {...(inputProps as any)}
        multiple
        value={(value as string[])?.map((date) => dayjs(date))}
        onChange={handleMutipleChange}
      />
    )
  }

  return null
}
