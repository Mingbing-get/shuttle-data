import { InputNumber, InputNumberProps } from 'antd'
import { DataModel } from '@shuttle-data/type'

export default function DoubleFormInputRender({
  dataModel,
  useApiName,
  field,
  value,
  onChange,
  style,
  ...inputNumberProps
}: DataModel.Render.FormInputRenderProps<'double', number> &
  Omit<
    InputNumberProps<number>,
    'value' | 'onChange' | 'min' | 'max' | 'precision'
  >) {
  return (
    <InputNumber
      {...inputNumberProps}
      style={{ width: '100%', ...style }}
      min={field.extra?.min}
      max={field.extra?.max}
      precision={field.extra?.decimal}
      value={value}
      onChange={onChange}
    />
  )
}
