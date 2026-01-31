import { Tag, TagProps } from 'antd'
import { DataModel } from '@shuttle-data/type'

export default function BooleanDisplayRender({
  dataModel,
  useApiName,
  field,
  value,
  ...tagProps
}: DataModel.Render.DisplayRenderProps<'boolean', boolean> &
  Omit<TagProps, 'color' | 'children'>) {
  return (
    <Tag color={value ? 'green' : 'red'} {...tagProps}>
      {value ? field.extra?.trueText || '是' : field.extra?.falseText || '否'}
    </Tag>
  )
}
