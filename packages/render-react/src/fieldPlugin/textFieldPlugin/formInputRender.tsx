import { Input } from 'antd'
import { TextAreaProps } from 'antd/es/input'
import { DataModel } from '@shuttle-data/type'

export default function TextFormInputRender({
  field,
  value,
  onChange,
  ...inputProps
}: DataModel.Render.FormInputRenderProps<'text', string> &
  Omit<TextAreaProps, 'value' | 'onChange'>) {
  return (
    <Input.TextArea
      {...inputProps}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}
