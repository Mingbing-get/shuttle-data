import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Form, Spin, FormProps, FormItemProps, Button, Flex } from 'antd'
import { DataModel as NDataModel } from '@shuttle-data/type'
import { DataModel } from '@shuttle-data/client'

import fieldPlugin from '../../fieldPlugin'
import { useTable } from '../../schema'
import useRefDebounce from '../../hooks/useRefDebounce'
import WaitLoadingButton from '../../components/waitLoadingButton'

import './index.scss'

export interface DataFormFieldConfig {
  required?: boolean
  label?: string
  hidden?: boolean
  disabled?: boolean
  order?: number
  Render?: React.ComponentType<
    NDataModel.Render.FormInputRenderProps<NDataModel.FieldType>
  >
  rules?: FormItemProps['rules']
}

interface ExportActions {
  reset: () => void
  submit: () => Promise<void>
}

export interface DataFormProps<Values = Record<string, any>> extends Omit<
  FormProps<Values>,
  'initialValues' | 'children' | 'form'
> {
  dataModel: DataModel
  tableName: string
  useApiName?: boolean

  showAll?: boolean
  value?: Values | number | string
  fieldConfigs?: Record<string, DataFormFieldConfig>
  footer?: (actions: ExportActions) => React.ReactNode
  afterSubmit?: (effectId: string) => void
}

const systemFields = [
  '_id',
  '_createdAt',
  '_updatedAt',
  '_createdBy',
  '_updatedBy',
]

export default function DataForm<Values = Record<string, any>>({
  dataModel,
  tableName,
  useApiName,
  showAll,
  value,
  fieldConfigs,
  layout = 'vertical',
  footer = defaultFooter,
  afterSubmit,
  ...formProps
}: DataFormProps<Values>) {
  const [form] = Form.useForm()
  const recordId = Form.useWatch('_id', form)
  const resetValue = useRef<Values>()

  const [recordLoading, setRecordLoading] = useState(false)
  const { table, loading: schemaLoading } = useTable(
    dataModel.schema,
    tableName,
    useApiName,
  )

  const crud = useMemo(() => {
    return dataModel.crud({
      modelName: tableName,
      useApiName,
    })
  }, [tableName, useApiName, dataModel])

  const getRecordById = useRefDebounce(async (id: number | string) => {
    setRecordLoading(true)
    try {
      const record = await crud.findOne({
        condition: {
          key: '_id',
          op: 'eq',
          value: id,
        },
      })
      form.setFieldsValue(record)
      resetValue.current = { ...record } as Values
    } catch (error) {
      throw error
    } finally {
      setRecordLoading(false)
    }
  })

  useEffect(() => {
    if (typeof value !== 'string' && typeof value !== 'number') {
      form.setFieldsValue(value || {})
      resetValue.current = { ...value } as Values
    } else {
      getRecordById(60)(value)
    }
  }, [value, crud])

  const isSystemField = useCallback((field: NDataModel.Field) => {
    return systemFields.includes(field.name)
  }, [])

  const showFields: (NDataModel.Field &
    Pick<DataFormFieldConfig, 'disabled' | 'hidden' | 'Render' | 'rules'>)[] =
    useMemo(() => {
      const fields = (table?.fields || []).map((field) => {
        const name = useApiName ? field.apiName : field.name
        const config = fieldConfigs?.[name] || {}
        const _isSystemField = isSystemField(field)

        const rules = config.rules || []
        if (!_isSystemField && (config.required || field.required)) {
          rules.push({ required: true })
        }

        return {
          ...field,
          name,
          ...config,
          hidden: config.hidden || (!recordId && _isSystemField),
          disabled: config.disabled || _isSystemField,
          rules,
          Render:
            config.Render ||
            fieldPlugin.getPlugin(field.type).getFormInputRender(),
        }
      })

      fields.sort((a, b) => {
        return (a.order || 0) - (b.order || 0)
      })

      if (showAll) {
        return fields
      }

      const configFields = Object.keys(fieldConfigs || {})
      if (configFields.length === 0) return fields

      return fields.filter((field) => configFields.includes(field.name))
    }, [showAll, fieldConfigs, useApiName, table, recordId])

  const reset = useCallback(async () => {
    form.setFieldsValue(resetValue.current || {})
  }, [])

  const submit = useCallback(async () => {
    await form.validateFields()

    const value = form.getFieldsValue()
    if (value._id) {
      const ids = await crud.update({
        data: [value],
      })
      if (ids.length > 0) {
        afterSubmit?.(ids[0])
      }
    } else {
      const id = await crud.create({
        data: value,
      })
      afterSubmit?.(id)
    }
  }, [crud, afterSubmit])

  const footerElement = useMemo(
    () => footer({ reset, submit }),
    [footer, reset, submit],
  )

  return (
    <Spin spinning={schemaLoading || recordLoading}>
      <Form {...formProps} layout={layout} form={form}>
        {showFields.map((field) => {
          if (!field.Render) return null

          return (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={field.rules}
              hidden={field.hidden}
            >
              <field.Render
                dataModel={dataModel}
                useApiName={useApiName}
                field={field}
                disabled={field.disabled}
                value={form.getFieldValue(field.name)}
                onChange={(value) => {
                  form.setFieldValue(field.name, value)
                }}
              />
            </Form.Item>
          )
        })}
        {footerElement}
      </Form>
    </Spin>
  )
}

function defaultFooter({ reset, submit }: ExportActions) {
  return (
    <Form.Item className="shuttle-data-form-footer">
      <Flex gap={16} justify="center">
        <Button onClick={reset}>重置</Button>
        <WaitLoadingButton onClick={submit} type="primary">
          提交
        </WaitLoadingButton>
      </Flex>
    </Form.Item>
  )
}
