import { InputNumber, InputNumberProps } from 'antd'
import { DataModel } from '@shuttle-data/type'

export interface DoubleInputRenderExtraProps extends Omit<
  InputNumberProps<number>,
  'value' | 'onChange' | 'min' | 'max' | 'precision'
> {}

export interface DoubleFormInputRenderProps
  extends
    DataModel.Render.FormInputRenderProps<'double', number>,
    DoubleInputRenderExtraProps {}

export default function DoubleFormInputRender({
  dataModel,
  useApiName,
  field,
  value,
  onChange,
  style,
  ...inputNumberProps
}: DoubleFormInputRenderProps) {
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
