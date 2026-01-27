import {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react'
import {
  Row,
  Col,
  Form,
  Switch,
  TableColumnsType,
  Input,
  FormProps,
  FormInstance,
  Button,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { DataEnumManager } from '@shuttle-data/client'
import { DataEnum } from '@shuttle-data/type'

import PrefixInput from '../../components/prefixInput'
import FormTableItem from '../../components/formTableItem'

import './index.scss'
import { generateUUID } from '../../utils'

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
    disabled,
    ...formProps
  }: DataEnumGroupEditorProps,
  ref?: ForwardedRef<DataEnumGroupEditorInstance>,
) {
  const [form] = Form.useForm<DataEnum.Group>()
  const [initGroup, setInitGroup] = useState<DataEnum.Group>()

  useEffect(() => {
    if (!groupName) {
      setInitGroup(undefined)
      form.resetFields()
      return
    }

    manager.getGroup(groupName, useApiName).then((group) => {
      if (group) {
        group.items.sort((a, b) => (a.order || 0) - (b.order || 0))
        form.setFieldsValue(group)
        setInitGroup(group)
      } else {
        form.resetFields()
        setInitGroup(undefined)
      }
    })
  }, [groupName, useApiName])

  const handleAdd = useCallback(() => {
    const items = form.getFieldValue('items') || []

    form.setFieldValue('items', [...items, { name: generateUUID('temp_') }])
  }, [form])

  const tableColumns: TableColumnsType<DataEnum.Item> = useMemo(
    () => [
      {
        title: '唯一值',
        dataIndex: 'name',
        minWidth: 220,
        render: (_, field, index) => (
          <Form.Item name={['items', index, 'name']}>
            <Input disabled />
          </Form.Item>
        ),
      },
      {
        title: <label className="table-header-required">API名称</label>,
        render: (_, field, index) => (
          <Form.Item
            name={['items', index, 'apiName']}
            rules={[{ required: true, message: '请输入API名称' }]}
          >
            <PrefixInput prefix={prefix} />
          </Form.Item>
        ),
        minWidth: 220,
      },
      {
        title: <label className="table-header-required">名称</label>,
        render: (_, field, index) => (
          <Form.Item
            name={['items', index, 'label']}
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
        ),
        minWidth: 220,
      },
      {
        title: '是否禁用',
        render: (_, field, index) => (
          <Form.Item name={['items', index, 'isDisabled']} required>
            <Switch />
          </Form.Item>
        ),
        width: 120,
      },
    ],
    [prefix],
  )

  useImperativeHandle(
    ref,
    () => ({
      form,
      submit: async () => {
        await form.validateFields({ validateOnly: false })
        const value = form.getFieldsValue()

        value.items.forEach((item, index) => {
          item.order = index + 1
        })

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
      disabled={disabled || initGroup?.isSystem}
    >
      {initGroup && (
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
      <Form.Item name="items" hidden>
        <span />
      </Form.Item>
      <FormTableItem<DataEnum.Item>
        fieldName="items"
        rowKey="name"
        columns={tableColumns}
        pagination={false}
        scroll={{ x: 1000, y: '100%' }}
        onAdd={() => ({ name: generateUUID('temp_') }) as any}
        disabledDelete={(row) => !row.name.startsWith('temp_')}
        locale={{
          emptyText: (
            <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
              添加项
            </Button>
          ),
        }}
      />
    </Form>
  )
}

export default forwardRef(GroupEditor)
