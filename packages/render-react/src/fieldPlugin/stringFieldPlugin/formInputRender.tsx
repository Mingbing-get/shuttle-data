import { Input, InputProps } from 'antd'
import { DataModel } from '@shuttle-data/type'

export default function StringFormInputRender({
  field,
  value,
  onChange,
  ...inputProps
}: DataModel.Render.FormInputRenderProps<'string', string> &
  Omit<InputProps, 'value' | 'onChange' | 'max' | `data-${string}`>) {
  return (
    <Input
      {...inputProps}
      max={field.extra?.maxLength}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}
