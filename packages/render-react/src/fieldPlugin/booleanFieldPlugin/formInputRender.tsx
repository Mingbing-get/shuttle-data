import { Switch, SwitchProps } from 'antd'
import { DataModel } from '@shuttle-data/type'

export default function BooleanFormInputRender({
  dataModel,
  useApiName,
  field,
  value,
  onChange,
  ...switchProps
}: DataModel.Render.FormInputRenderProps<'boolean', boolean> &
  Omit<
    SwitchProps,
    'checked' | 'onChange' | 'checkedChildren' | 'unCheckedChildren'
  >) {
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
