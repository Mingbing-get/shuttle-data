import { useCallback } from 'react'
import { DatePicker, DatePickerProps } from 'antd'
import { DataModel } from '@shuttle-data/type'
import dayjs, { Dayjs } from 'dayjs'

export interface DateInputRenderExtraProps extends Omit<
  DatePickerProps<Dayjs, false>,
  'value' | 'onChange' | 'mode' | 'multiple' | 'format' | 'showTime'
> {}

export interface DateFormInputRenderProps
  extends
    DataModel.Render.FormInputRenderProps<'date', string>,
    DateInputRenderExtraProps {}

export default function DateFormInputRender({
  dataModel,
  useApiName,
  field,
  value,
  onChange,
  style,
  ...dateProps
}: DateFormInputRenderProps) {
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
