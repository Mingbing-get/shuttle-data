import { InputNumber, InputNumberProps } from 'antd'
import { DataModel } from '@shuttle-data/type'

export default function NumberFormInputRender({
  field,
  value,
  onChange,
  style,
  ...inputNumberProps
}: DataModel.Render.FormInputRenderProps<'number', number> &
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
      precision={0}
      value={value}
      onChange={onChange}
    />
  )
}
