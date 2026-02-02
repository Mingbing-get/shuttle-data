import { Input, InputProps } from 'antd'
import { DataModel } from '@shuttle-data/type'

export interface StringFormInputRenderExtraProps extends Omit<
  InputProps,
  'value' | 'onChange' | 'max' | `data-${string}`
> {}

export interface StringFormInputRenderProps
  extends
    DataModel.Render.FormInputRenderProps<'string', string>,
    StringFormInputRenderExtraProps {}

export default function StringFormInputRender({
  dataModel,
  useApiName,
  field,
  value,
  onChange,
  ...inputProps
}: StringFormInputRenderProps) {
  return (
    <Input
      {...inputProps}
      max={field.extra?.maxLength}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}
