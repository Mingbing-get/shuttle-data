import { useMemo } from 'react'
import { Form, Switch } from 'antd'
import { DataModel } from '@shuttle-data/type'

export default function TextSettingRender({
  disabled,
  field,
  prePath,
}: DataModel.Render.SettingRenderProps<'text'>) {
  const isNewField = useMemo(
    () => !field.name || field.name.startsWith('temp_'),
    [field],
  )

  return (
    <>
      <Form.Item name={[...prePath, 'unique']} label="是否唯一">
        <Switch disabled={field.isSystem || !isNewField || disabled} />
      </Form.Item>
    </>
  )
}
