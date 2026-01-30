import { useMemo } from 'react'
import { Form, Switch } from 'antd'
import { DataModel } from '@shuttle-data/type'
import GroupSelect from '../../dataEnum/groupSelect'

export default function EnumSettingRender({
  field,
  prePath,
  enumManager,
}: DataModel.Render.SettingRenderProps<'enum'>) {
  const isNewField = useMemo(
    () => !field.name || field.name.startsWith('temp_'),
    [field],
  )

  return (
    <>
      <Form.Item name={[...prePath, 'groupName']} label="枚举组">
        <GroupSelect
          manager={enumManager}
          disabled={field.isSystem || !isNewField}
        />
      </Form.Item>

      <Form.Item name={[...prePath, 'multiple']} label="是否多选">
        <Switch disabled={field.isSystem || !isNewField} />
      </Form.Item>
    </>
  )
}
