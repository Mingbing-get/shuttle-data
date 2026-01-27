import { useMemo } from 'react'
import { Form, Input, Divider, Switch } from 'antd'
import { DataModel } from '@shuttle-data/type'
import { DataModelSchema, DataEnumManager } from '@shuttle-data/client'

import PrefixInput from '../../components/prefixInput'
import FieldTypeSelect from '../fieldTypeSelect'
import renderFieldPlugin from '../fieldPlugin'
import { apiNameRules, labelRules } from '../../utils'

interface Props {
  schema: DataModelSchema
  enumManager: DataEnumManager
  field: DataModel.Field
  index: number
  fieldListName?: string
  prefix?: string
}

export default function FieldSetting({
  schema,
  enumManager,
  field,
  index,
  fieldListName = 'fields',
  prefix,
}: Props) {
  const Render = useMemo(() => {
    const plugin = renderFieldPlugin.getPlugin(field.type)
    return plugin?.getSettingRender?.()
  }, [field.type])

  const isNewField = useMemo(
    () => !field.name || field.name.startsWith('temp_'),
    [field],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Form.Item name={[fieldListName, index, 'name']} label="唯一值">
        <Input disabled />
      </Form.Item>

      <Form.Item
        name={[fieldListName, index, 'apiName']}
        rules={apiNameRules}
        label="API名称"
      >
        <PrefixInput
          prefix={field?.isSystem ? '' : prefix}
          disabled={field?.isSystem}
        />
      </Form.Item>

      <Form.Item
        name={[fieldListName, index, 'label']}
        rules={labelRules}
        label="名称"
      >
        <Input disabled={field?.isSystem} />
      </Form.Item>

      <Form.Item
        name={[fieldListName, index, 'type']}
        rules={[{ required: true, message: '请选择类型' }]}
        label="类型"
      >
        <FieldTypeSelect disabled={field?.isSystem || !isNewField} />
      </Form.Item>

      <Form.Item name={[fieldListName, index, 'required']} label="是否必填">
        <Switch disabled={field?.isSystem} />
      </Form.Item>

      {Render && (
        <>
          <Divider style={{ marginTop: 0 }} />
          <Render
            field={field}
            prePath={[fieldListName, index, 'extra']}
            schema={schema}
            enumManager={enumManager}
          />
        </>
      )}
    </div>
  )
}
