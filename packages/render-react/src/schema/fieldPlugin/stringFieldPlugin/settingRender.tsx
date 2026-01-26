import { useMemo } from 'react'
import { Form, Switch, InputNumber } from 'antd'
import { DataModel } from '@shuttle-data/type'

export default function StringSettingRender({
  field,
  prePath,
}: DataModel.Render.SettingRenderProps<'string'>) {
  const isNewField = useMemo(
    () => !field.name || field.name.startsWith('temp_'),
    [field],
  )

  return (
    <>
      <Form.Item name={[...prePath, 'unique']} label="是否唯一">
        <Switch disabled={field.isSystem || !isNewField} />
      </Form.Item>

      <Form.Item name={[...prePath, 'maxLength']} label="最大长度">
        <InputNumber
          disabled={field.isSystem}
          precision={0}
          min={1}
          max={255}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </>
  )
}
