import { useMemo } from 'react'
import { Form, Switch, Input } from 'antd'
import { DataModel } from '@shuttle-data/type'

export default function DateTimeSettingRender({
  field,
  prePath,
}: DataModel.Render.SettingRenderProps<'datetime'>) {
  const isNewField = useMemo(
    () => !field.name || field.name.startsWith('temp_'),
    [field],
  )

  return (
    <>
      <Form.Item name={[...prePath, 'unique']} label="是否唯一">
        <Switch disabled={field.isSystem || !isNewField} />
      </Form.Item>

      <Form.Item name={[...prePath, 'format']} label="日期时间格式">
        <Input defaultValue="YYYY-MM-DD HH:mm:ss" disabled={field.isSystem} />
      </Form.Item>
    </>
  )
}
