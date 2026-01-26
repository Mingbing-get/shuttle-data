import { useMemo } from 'react'
import { Form, Switch } from 'antd'
import { DataModel } from '@shuttle-data/type'
import TableSelect from '../../tableSelect'

export default function LookupSettingRender({
  field,
  prePath,
  schema,
}: DataModel.Render.SettingRenderProps<'lookup'>) {
  const isNewField = useMemo(
    () => !field.name || field.name.startsWith('temp_'),
    [field],
  )

  return (
    <>
      <Form.Item name={[...prePath, 'modalName']} label="关联模型">
        <TableSelect schema={schema} disabled={field.isSystem || !isNewField} />
      </Form.Item>

      <Form.Item name={[...prePath, 'multiple']} label="是否多选">
        <Switch disabled={field.isSystem || !isNewField} />
      </Form.Item>

      {!field.extra?.multiple && (
        <Form.Item name={[...prePath, 'unique']} label="是否唯一">
          <Switch disabled={field.isSystem || !isNewField} />
        </Form.Item>
      )}
    </>
  )
}
