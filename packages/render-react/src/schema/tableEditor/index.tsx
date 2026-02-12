import {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
  useMemo,
} from 'react'
import {
  Form,
  Tag,
  TableColumnsType,
  Input,
  FormProps,
  FormInstance,
  message,
} from 'antd'
import classNames from 'classnames'
import { DataModelSchema, DataEnumManager } from '@shuttle-data/client'
import { DataModel } from '@shuttle-data/type'

import FieldTypeSelect from '../fieldTypeSelect'
import { getInitDataModel } from '../utils'
import { generateUUID, apiNameRules, labelRules } from '../../utils'
import PrefixInput from '../../components/prefixInput'
import TableSetting from './tableSetting'
import FieldSetting from './fieldSetting'
import FormTableItem from '../../components/formTableItem'

import './index.scss'

export interface TableEditorProps extends Omit<FormProps, 'form'> {
  dataSourceName: string
  userTableName?: string
  schema: DataModelSchema
  enumManager: DataEnumManager
  tableName?: string
  table?: DataModel.Define
  useApiName?: boolean
  prefix?: string
}

export interface TableEditorInstance {
  form: FormInstance<DataModel.Define>
  submit: () => Promise<void>
}

function TableEditor(
  {
    schema,
    enumManager,
    dataSourceName,
    userTableName,
    tableName,
    table,
    useApiName = false,
    layout = 'vertical',
    className,
    prefix,
    disabled,
    ...formProps
  }: TableEditorProps,
  ref?: ForwardedRef<TableEditorInstance>,
) {
  const [form] = Form.useForm<DataModel.Define>()
  const [initTable, setInitTable] = useState<DataModel.Define>()
  const [focusFieldName, setFocusFieldName] = useState<string>('')
  const fields = Form.useWatch('fields', form)

  const filterEmptyFields = useMemo(
    () => fields?.filter((item) => item.name) || [],
    [fields],
  )

  useEffect(() => {
    if (table) {
      table.fields.sort((cur, next) => (cur.order || 0) - (next.order || 0))
      form.setFieldsValue(table)
      setInitTable(table)
      return
    }

    if (!tableName) {
      form.resetFields()
      form.setFieldsValue(getInitDataModel({ dataSourceName, userTableName }))
      return
    }

    schema.getTable(tableName, useApiName).then((table) => {
      if (table) {
        table.fields.sort((cur, next) => (cur.order || 0) - (next.order || 0))
        form.setFieldsValue(table)
        setInitTable(table)
      } else {
        form.setFieldsValue(getInitDataModel({ dataSourceName, userTableName }))
        setInitTable(undefined)
      }
    })
  }, [table, tableName, useApiName, dataSourceName, userTableName])

  const tableColumns: TableColumnsType<DataModel.Field> = useMemo(() => {
    return [
      {
        title: '唯一值',
        dataIndex: 'name',
        minWidth: 220,
        render: (_, field, index) => (
          <Form.Item name={['fields', index, 'name']}>
            <Input disabled />
          </Form.Item>
        ),
      },
      {
        title: <label className="table-header-required">API名称</label>,
        render: (_, field, index) => (
          <Form.Item name={['fields', index, 'apiName']} rules={apiNameRules}>
            <PrefixInput
              prefix={field?.isSystem ? '' : prefix}
              disabled={field?.isSystem || disabled}
            />
          </Form.Item>
        ),
        minWidth: 220,
      },
      {
        title: <label className="table-header-required">名称</label>,
        render: (_, field, index) => (
          <Form.Item name={['fields', index, 'label']} rules={labelRules}>
            <Input disabled={field?.isSystem || disabled} />
          </Form.Item>
        ),
        minWidth: 220,
      },
      {
        title: <label className="table-header-required">类型</label>,
        render: (_, field, index) => (
          <Form.Item
            name={['fields', index, 'type']}
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <FieldTypeSelect
              disabled={field?.isSystem || !field.name.startsWith('temp_')}
            />
          </Form.Item>
        ),
        width: 160,
      },
      {
        title: '系统字段',
        render: (_, field, index) => (
          <Form.Item name={['fields', index, 'isSystem']}>
            {field.isSystem ? (
              <Tag color="green">是</Tag>
            ) : (
              <Tag color="orange">否</Tag>
            )}
          </Form.Item>
        ),
        width: 100,
      },
    ]
  }, [prefix, disabled])

  useImperativeHandle(
    ref,
    () => ({
      form,
      submit: async () => {
        await form.validateFields({ validateOnly: false })
        const value = form.getFieldsValue()

        const apiNameList: string[] = []
        for (const [index, field] of value.fields.entries()) {
          field.order = index + 1
          if (apiNameList.includes(field.apiName)) {
            message.error(`API 名称: ${field.apiName} 不能重复`)
            throw new Error('API 名称不能重复')
          }
          apiNameList.push(field.apiName)
        }

        if (value.name) {
          await schema.updateTable(value)
        } else {
          await schema.createTable(value)
        }
      },
    }),
    [form],
  )

  return (
    <Form
      {...formProps}
      disabled={disabled}
      form={form}
      layout={layout}
      className={classNames(className, 'data-schema-editor')}
    >
      <div className="data-schema-editor-fields">
        <Form.Item name="fields" hidden>
          <span />
        </Form.Item>
        <FormTableItem
          disabled={disabled}
          fieldName="fields"
          rowKey="name"
          columns={tableColumns}
          pagination={false}
          scroll={{ x: 1200, y: '100%' }}
          onFocusRowChange={setFocusFieldName}
          onAdd={() => ({ name: generateUUID('temp_') }) as any}
          disabledDelete={(row) => row.isSystem}
        />
      </div>
      <div className="data-schema-editor-detail">
        <RightPanel show={!focusFieldName}>
          <TableSetting
            disabled={disabled}
            initTable={initTable}
            prefix={prefix}
            fields={filterEmptyFields}
            isSystemModel={initTable?.isSystem}
          />
        </RightPanel>
        {filterEmptyFields?.map((field, index) => (
          <RightPanel key={field.name} show={field.name === focusFieldName}>
            <FieldSetting
              disabled={disabled}
              key={field.name}
              schema={schema}
              enumManager={enumManager}
              field={field}
              index={index}
              prefix={prefix}
            />
          </RightPanel>
        ))}
      </div>
    </Form>
  )
}

export default forwardRef(TableEditor)

interface RightPanelProps {
  show?: boolean
  children?: React.ReactNode
}
function RightPanel({ show, children }: RightPanelProps) {
  return <div style={{ display: show ? 'block' : 'none' }}>{children}</div>
}
