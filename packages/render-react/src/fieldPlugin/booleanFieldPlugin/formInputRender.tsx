import { Switch, SwitchProps } from 'antd'
import { DataModel } from '@shuttle-data/type'

export interface BooleanInputRenderExtraProps extends Omit<
  SwitchProps,
  'checked' | 'onChange' | 'checkedChildren' | 'unCheckedChildren'
> {}

export interface BooleanFormInputRenderProps
  extends
    DataModel.Render.FormInputRenderProps<'boolean', boolean>,
    BooleanInputRenderExtraProps {}

export default function BooleanFormInputRender({
  dataModel,
  useApiName,
  field,
  value,
  onChange,
  ...switchProps
}: BooleanFormInputRenderProps) {
  return (
    <Switch
      {...switchProps}
      checked={value}
      onChange={onChange}
      checkedChildren={field.extra?.trueText || '是'}
      unCheckedChildren={field.extra?.falseText || '否'}
    />
  )
}
