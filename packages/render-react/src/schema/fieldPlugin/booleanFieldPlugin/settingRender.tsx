import { Form, Input } from 'antd'
import { DataModel } from '@shuttle-data/type'

export default function BooleanSettingRender({
  field,
  prePath,
}: DataModel.Render.SettingRenderProps<'boolean'>) {
  return (
    <>
      <Form.Item name={[...prePath, 'trueText']} label="真值文本">
        <Input defaultValue="是" disabled={field.isSystem} />
      </Form.Item>

      <Form.Item name={[...prePath, 'falseText']} label="假值文本">
        <Input defaultValue="否" disabled={field.isSystem} />
      </Form.Item>
    </>
  )
}
