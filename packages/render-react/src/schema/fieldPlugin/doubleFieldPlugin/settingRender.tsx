import { Form, InputNumber } from 'antd'
import { DataModel } from '@shuttle-data/type'

export default function DoubleSettingRender({
  field,
  prePath,
}: DataModel.Render.SettingRenderProps<'double'>) {
  return (
    <>
      <Form.Item name={[...prePath, 'min']} label="最小值">
        <InputNumber disabled={field.isSystem} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name={[...prePath, 'max']} label="最大值">
        <InputNumber disabled={field.isSystem} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name={[...prePath, 'decimal']} label="小数位数">
        <InputNumber
          disabled={field.isSystem}
          precision={0}
          max={8}
          min={0}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </>
  )
}
