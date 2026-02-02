import { Input } from 'antd'
import { TextAreaProps } from 'antd/es/input'
import { DataModel } from '@shuttle-data/type'

export interface TextFormInputRenderExtraProps extends Omit<
  TextAreaProps,
  'value' | 'onChange'
> {}

export interface TextFormInputRenderProps
  extends
    DataModel.Render.FormInputRenderProps<'text', string>,
    TextFormInputRenderExtraProps {}

export default function TextFormInputRender({
  dataModel,
  useApiName,
  field,
  value,
  onChange,
  ...inputProps
}: TextFormInputRenderProps) {
  return (
    <Input.TextArea
      {...inputProps}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}
