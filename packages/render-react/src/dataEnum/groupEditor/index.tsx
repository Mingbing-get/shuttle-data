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
  ColorPicker,
  FormProps,
  FormInstance,
  Button,
  message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { DataEnumManager } from '@shuttle-data/client'
import { DataEnum } from '@shuttle-data/type'

import PrefixInput from '../../components/prefixInput'
import FormTableItem from '../../components/formTableItem'
import {
  generateUUID,
  apiNameRules,
  labelRules,
  presetColors,
} from '../../utils'

import './index.scss'

export interface DataEnumGroupEditorProps extends Omit<FormProps, 'form'> {
  manager: DataEnumManager
  group?: DataEnum.Group
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
    group,
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

  const fitGroup = useCallback(
    async (group: DataEnum.Group) => {
      const hasGroup = await manager.hasGroup(group.name)

      if (!hasGroup) {
        delete (group as any).name

        group.items = group.items.map((item) => {
          const newItem = { ...item, name: generateUUID('temp_') }

          return newItem
        })
      } else {
        const oldGroup = await manager.getGroup(group.name)

        group.items = group.items.map((item) => {
          const oldItem = oldGroup?.items.find((f) => f.name === item.name)
          if (oldItem) return item

          const newItem = { ...item, name: generateUUID('temp_') }

          return newItem
        })
      }

      form.setFieldsValue(group)
      setInitGroup(group)
    },
    [manager],
  )

  useEffect(() => {
    if (group) {
      if (disabled) {
        group.items.sort((cur, next) => (cur.order || 0) - (next.order || 0))
        form.setFieldsValue(group)
        setInitGroup(group)
      } else {
        fitGroup(group)
      }
      return
    }

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
  }, [group, disabled, groupName, useApiName])

  const handleAdd = useCallback(() => {
    const items = form.getFieldValue('items') || []

    form.setFieldValue('items', [...items, { name: generateUUID('temp_') }])
  }, [form])

  const tableColumns: TableColumnsType<DataEnum.Item> = useMemo(
    () => [
      {
        title: '唯一标识',
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
          <Form.Item name={['items', index, 'apiName']} rules={apiNameRules}>
            <PrefixInput prefix={prefix} />
          </Form.Item>
        ),
        minWidth: 220,
      },
      {
        title: <label className="table-header-required">名称</label>,
        render: (_, field, index) => (
          <Form.Item name={['items', index, 'label']} rules={labelRules}>
            <Input />
          </Form.Item>
        ),
        minWidth: 220,
      },
      {
        title: '颜色',
        render: (_, field, index) => (
          <Form.Item
            name={['items', index, 'color']}
            getValueFromEvent={(_, color) => color}
          >
            <ColorPicker presets={presetColors} />
          </Form.Item>
        ),
        minWidth: 120,
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

        const apiNameList: string[] = []
        for (const [index, item] of value.items.entries()) {
          item.order = index + 1
          if (apiNameList.includes(item.apiName)) {
            message.error(`API 名称: ${item.apiName} 不能重复`)
            throw new Error('API 名称不能重复')
          }
          apiNameList.push(item.apiName)
        }

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
      {initGroup?.name && (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="name" label="唯一标识">
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
          <Form.Item name="apiName" label="API名称" rules={apiNameRules}>
            <PrefixInput prefix={prefix} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="label" label="名称" rules={labelRules}>
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
