import { useCallback } from 'react'
import { DatePicker, DatePickerProps } from 'antd'
import { DataModel } from '@shuttle-data/type'
import dayjs, { Dayjs } from 'dayjs'

export default function DateFormInputRender({
  field,
  value,
  onChange,
  style,
  ...dateProps
}: DataModel.Render.FormInputRenderProps<'date', string> &
  Omit<
    DatePickerProps<Dayjs, false>,
    'value' | 'onChange' | 'mode' | 'multiple' | 'format' | 'showTime'
  >) {
  const handleChange = useCallback(
    (date: Dayjs | null) => {
      if (!date) {
        onChange?.(undefined)
        return
      }

      onChange?.(dayjs(date).format('YYYY-MM-DD'))
    },
    [onChange],
  )

  return (
    <DatePicker
      {...dateProps}
      style={{ width: '100%', ...style }}
      mode="date"
      showTime={false}
      multiple={false}
      value={value ? dayjs(value) : undefined}
      onChange={handleChange}
      format={field.extra?.format || 'YYYY-MM-DD'}
    />
  )
}
