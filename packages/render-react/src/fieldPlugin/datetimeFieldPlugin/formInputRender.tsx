import { useCallback } from 'react'
import { DatePicker, DatePickerProps } from 'antd'
import { DataModel } from '@shuttle-data/type'
import dayjs, { Dayjs } from 'dayjs'

export interface DateTimeInputRenderExtraProps extends Omit<
  DatePickerProps<Dayjs, false>,
  'value' | 'onChange' | 'mode' | 'multiple' | 'format' | 'showTime'
> {}

export interface DateTimeFormInputRenderProps
  extends
    DataModel.Render.FormInputRenderProps<'datetime', string>,
    DateTimeInputRenderExtraProps {}

export default function DateTimeFormInputRender({
  dataModel,
  useApiName,
  field,
  value,
  onChange,
  style,
  ...dateProps
}: DateTimeFormInputRenderProps) {
  const handleChange = useCallback(
    (date: Dayjs | null) => {
      if (!date) {
        onChange?.(undefined)
        return
      }

      onChange?.(dayjs(date).format('YYYY-MM-DD HH:mm:ss'))
    },
    [onChange],
  )

  return (
    <DatePicker
      {...dateProps}
      style={{ width: '100%', ...style }}
      mode="date"
      showTime={true}
      multiple={false}
      value={value ? dayjs(value) : undefined}
      onChange={handleChange}
      format={field.extra?.format || 'YYYY-MM-DD HH:mm:ss'}
    />
  )
}
