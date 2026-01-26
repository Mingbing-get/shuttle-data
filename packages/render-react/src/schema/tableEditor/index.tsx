import {
  useCallback,
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
  useMemo,
} from 'react'
import {
  Form,
  Table,
  Button,
  Switch,
  TableColumnsType,
  Input,
  FormProps,
  FormInstance,
} from 'antd'
import classNames from 'classnames'
import { DataModelSchema, DataEnumManager } from '@shuttle-data/client'
import { DataModel } from '@shuttle-data/type'

import FieldTypeSelect from '../fieldTypeSelect'
import { getInitDataModel, generateUUID } from '../utils'
import PrefixInput from '../../components/prefixInput'
import TableSetting from './tableSetting'
import FieldSetting from './fieldSetting'

import './index.scss'

export interface TableEditorProps extends Omit<FormProps, 'form'> {
  dataSourceName: string
  userTableName?: string
  schema: DataModelSchema
  enumManager: DataEnumManager
  tableName?: string
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
    useApiName = false,
    layout = 'vertical',
    className,
    prefix,
    ...formProps
  }: TableEditorProps,
  ref?: ForwardedRef<TableEditorInstance>,
) {
  const [form] = Form.useForm<DataModel.Define>()
  const [initTable, setInitTable] = useState<DataModel.Define>()
  const [focusFieldName, setFocusFieldName] = useState<string>('')
  const fields = Form.useWatch('fields', form)

  const filterEmptyFields = useMemo(
    () => fields?.filter((field) => field.name),
    [fields],
  )

  useEffect(() => {
    if (!tableName) {
      form.resetFields()
      form.setFieldsValue(getInitDataModel({ dataSourceName, userTableName }))
      return
    }

    schema.getTable(tableName, useApiName).then((table) => {
      if (table) {
        form.setFieldsValue(table)
        setInitTable(table)
      } else {
        form.setFieldsValue(getInitDataModel({ dataSourceName, userTableName }))
        setInitTable(undefined)
      }
    })
  }, [tableName, useApiName, dataSourceName, userTableName])

  const handleRemove = useCallback((fieldName: string) => {
    const fields = form.getFieldValue('fields') || []
    const index = fields.findIndex(
      (field: DataModel.Field) => field.name === fieldName,
    )
    if (index !== -1) {
      const newFields = [...fields]
      newFields.splice(index, 1)
      form.setFieldValue('fields', newFields)
      setFocusFieldName((old) => (old === fieldName ? '' : old))
    }
  }, [])

  const handleAdd = useCallback(() => {
    const name = generateUUID('temp_')
    const fields = form.getFieldValue('fields') || []
    const newFields = [{ name }, ...fields]
    form.setFieldValue('fields', newFields)
    setFocusFieldName(name)
  }, [])

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
          <Form.Item
            name={['fields', index, 'apiName']}
            rules={[{ required: true, message: '请输入API名称' }]}
          >
            <PrefixInput
              prefix={field?.isSystem ? '' : prefix}
              disabled={field?.isSystem}
            />
          </Form.Item>
        ),
        minWidth: 220,
      },
      {
        title: <label className="table-header-required">名称</label>,
        render: (_, field, index) => (
          <Form.Item
            name={['fields', index, 'label']}
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input disabled={field?.isSystem} />
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
            <FieldTypeSelect disabled={field?.isSystem} />
          </Form.Item>
        ),
        width: 160,
      },
      {
        title: '系统字段',
        render: (_, field, index) => (
          <Form.Item name={['fields', index, 'isSystem']} required>
            <Switch disabled />
          </Form.Item>
        ),
        width: 100,
      },
      {
        title: '操作',
        key: 'operation',
        render: (_, field, index) => {
          return (
            <Form.Item name={['fields', index, 'isSystem']}>
              <Button
                disabled={field?.isSystem}
                type="link"
                danger
                onClick={() => handleRemove(field.name)}
              >
                删除
              </Button>
            </Form.Item>
          )
        },
        fixed: 'end',
        width: 100,
      },
    ]
  }, [prefix])

  useImperativeHandle(
    ref,
    () => ({
      form,
      submit: async () => {
        await form.validateFields({ validateOnly: false })
        const value = form.getFieldsValue()

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
      form={form}
      layout={layout}
      className={classNames(className, 'data-schema-editor')}
    >
      <div className="data-schema-editor-fields">
        <Form.Item name="fields" hidden>
          <span />
        </Form.Item>
        <Table
          onRow={(record) => {
            return {
              onClick: () => {
                setFocusFieldName(record.name)
              },
            }
          }}
          onHeaderRow={() => {
            return {
              onClick: () => {
                setFocusFieldName('')
              },
            }
          }}
          rowClassName={(record) => {
            return record.name === focusFieldName ? 'table-row-focused' : ''
          }}
          rowKey="name"
          dataSource={filterEmptyFields}
          columns={tableColumns}
          pagination={false}
          scroll={{ x: 1200, y: '100%' }}
          footer={() => (
            <Button type="primary" block onClick={handleAdd}>
              添加字段
            </Button>
          )}
        />
      </div>
      <div className="data-schema-editor-detail">
        <RightPanel show={!focusFieldName}>
          <TableSetting
            initTable={initTable}
            prefix={prefix}
            fields={filterEmptyFields}
            isSystemModel={initTable?.isSystem}
          />
        </RightPanel>
        {filterEmptyFields?.map((field, index) => (
          <RightPanel key={field.name} show={field.name === focusFieldName}>
            <FieldSetting
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
