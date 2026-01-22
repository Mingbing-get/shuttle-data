import {
  useCallback,
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from 'react'
import {
  Row,
  Col,
  Form,
  Table,
  Button,
  Switch,
  TableColumnsType,
  FormListFieldData,
  Input,
  FormProps,
  FormInstance,
} from 'antd'
import classNames from 'classnames'
import { DataEnumManager } from '@shuttle-data/client'
import { DataEnum } from '@shuttle-data/type'

import PrefixInput from '../../components/prefixInput'

import './index.scss'

export interface DataEnumGroupEditorProps extends Omit<FormProps, 'form'> {
  manager: DataEnumManager
  groupName?: string
  useApiName?: boolean
  prefix?: string
}

export interface DataEnumGroupEditorInstance {
  form: FormInstance<DataEnum.Group>
  submit: () => Promise<void>
}

function GroupEditor(
  {
    manager,
    groupName,
    useApiName = false,
    layout = 'vertical',
    className,
    prefix,
    ...formProps
  }: DataEnumGroupEditorProps,
  ref?: ForwardedRef<DataEnumGroupEditorInstance>,
) {
  const [form] = Form.useForm<DataEnum.Group>()
  const [showName, setShowName] = useState(false)

  useEffect(() => {
    if (!groupName) {
      setShowName(false)
      form.resetFields()
      return
    }

    manager.getGroup(groupName, useApiName).then((group) => {
      if (group) {
        form.setFieldsValue(group)
        setShowName(true)
      } else {
        form.resetFields()
        setShowName(false)
      }
    })
  }, [groupName, useApiName])

  const createTableColumns = useCallback(
    (remove: (name: number) => void) => {
      const tableColumns: TableColumnsType<FormListFieldData> = [
        {
          title: '唯一值',
          dataIndex: 'name',
          minWidth: 220,
          render: (_, field) => (
            <Form.Item name={[field.name, 'name']}>
              <Input disabled />
            </Form.Item>
          ),
        },
        {
          title: <label className="table-header-required">API名称</label>,
          render: (_, field) => (
            <Form.Item
              name={[field.name, 'apiName']}
              rules={[{ required: true, message: '请输入API名称' }]}
            >
              <PrefixInput prefix={prefix} />
            </Form.Item>
          ),
          minWidth: 220,
        },
        {
          title: <label className="table-header-required">名称</label>,
          render: (_, field) => (
            <Form.Item
              name={[field.name, 'label']}
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input />
            </Form.Item>
          ),
          minWidth: 220,
        },
        {
          title: '是否禁用',
          render: (_, field) => (
            <Form.Item name={[field.name, 'isDisabled']} required>
              <Switch />
            </Form.Item>
          ),
          minWidth: 120,
        },
        {
          title: '操作',
          render: (_, field) => {
            return (
              <Form.Item name={[field.name, 'name']}>
                <RemoveItem remove={() => remove(field.name)} />
              </Form.Item>
            )
          },
          width: 120,
        },
      ]
      return tableColumns
    },
    [prefix],
  )

  useImperativeHandle(
    ref,
    () => ({
      form,
      submit: async () => {
        await form.validateFields({ validateOnly: false })
        const value = form.getFieldsValue()

        if (value.name) {
          await manager.updateGroup(value)
        } else {
          await manager.addGroup(value)
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
      className={classNames(className, 'data-enum-group-editor')}
    >
      {showName && (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="name" label="唯一值">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isSystem" label="系统枚举组">
              <Switch disabled />
            </Form.Item>
          </Col>
        </Row>
      )}
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="apiName"
            label="API名称"
            rules={[{ required: true, message: '请输入API名称' }]}
          >
            <PrefixInput prefix={prefix} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="label"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="枚举项">
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <Table
              dataSource={fields}
              columns={createTableColumns(remove)}
              pagination={false}
              footer={() => (
                <Button type="primary" block onClick={() => add()}>
                  添加枚举项
                </Button>
              )}
            />
          )}
        </Form.List>
      </Form.Item>
    </Form>
  )
}

export default forwardRef(GroupEditor)

interface RemoveItemProps {
  value?: string
  remove: () => void
}
function RemoveItem({ value, remove }: RemoveItemProps) {
  return (
    <Button disabled={!!value} type="link" danger onClick={remove}>
      删除
    </Button>
  )
}
