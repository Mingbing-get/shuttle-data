import { useMemo } from 'react'
import { Form, Input, Switch, Select, Divider } from 'antd'
import { DataModel, dataModelManager } from '@shuttle-data/type'

import PrefixInput from '../../components/prefixInput'

interface Props {
  prefix?: string
  initTable?: DataModel.Define
  isSystemModel?: boolean
  fields?: DataModel.Field[]
}

export default function TableSetting({
  initTable,
  prefix,
  isSystemModel,
  fields,
}: Props) {
  const displayFields = useMemo(() => {
    return (
      fields?.filter((field) => {
        const plugin = dataModelManager.getPlugin(field.type)
        return plugin?.canAsDisplay
      }) || []
    )
  }, [fields])

  return (
    <>
      <Form.Item name="dataSourceName" label="数据源" hidden>
        <Input disabled />
      </Form.Item>

      {initTable?.name && (
        <>
          <Form.Item name="name" label="唯一值">
            <Input disabled />
          </Form.Item>

          <Form.Item name="isSystem" label="系统模型">
            <Switch disabled />
          </Form.Item>

          <Divider />
        </>
      )}

      <Form.Item
        name="displayField"
        label="展示字段"
        rules={[{ required: true, message: '请选择展示字段' }]}
      >
        <Select
          disabled={isSystemModel}
          fieldNames={{
            label: 'label',
            value: 'name',
          }}
          options={displayFields}
        />
      </Form.Item>

      <Form.Item
        name="apiName"
        label="API名称"
        rules={[{ required: true, message: '请输入API名称' }]}
      >
        <PrefixInput
          prefix={isSystemModel ? '' : prefix}
          disabled={isSystemModel}
        />
      </Form.Item>

      <Form.Item
        name="label"
        label="名称"
        rules={[{ required: true, message: '请输入名称' }]}
      >
        <Input disabled={isSystemModel} />
      </Form.Item>
    </>
  )
}
