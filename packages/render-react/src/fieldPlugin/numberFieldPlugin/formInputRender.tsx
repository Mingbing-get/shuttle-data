import { InputNumber, InputNumberProps } from 'antd'
import { DataModel } from '@shuttle-data/type'

export interface NumberInputRenderExtraProps extends Omit<
  InputNumberProps<number>,
  'value' | 'onChange' | 'min' | 'max' | 'precision'
> {}

export interface NumberFormInputRenderProps
  extends
    DataModel.Render.FormInputRenderProps<'number', number>,
    NumberInputRenderExtraProps {}

export default function NumberFormInputRender({
  dataModel,
  useApiName,
  field,
  value,
  onChange,
  style,
  ...inputNumberProps
}: NumberFormInputRenderProps) {
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
