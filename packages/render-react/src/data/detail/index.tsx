import { useEffect, useMemo, useState } from 'react'
import { Descriptions, DescriptionsProps, Breakpoint, Spin } from 'antd'
import { DataModel as NDataModel } from '@shuttle-data/type'
import { DataModel } from '@shuttle-data/client'

import fieldPlugin from '../../fieldPlugin'
import { useTable } from '../../schema'
import useRefDebounce from '../../hooks/useRefDebounce'

export interface DataDetailFieldConfig {
  label?: string
  span?:
    | number
    | 'filled'
    | {
        [key in Breakpoint]?: number
      }
  order?: number
  Render?: React.ComponentType<
    NDataModel.Render.DisplayRenderProps<NDataModel.FieldType>
  >
}

export interface DataDetailProps extends Omit<
  DescriptionsProps,
  'items' | 'children'
> {
  dataModel: DataModel
  tableName: string
  useApiName?: boolean

  showAll?: boolean
  value?: Record<string, any> | number | string
  fieldConfigs?: Record<string, DataDetailFieldConfig>
}

export default function DataDetail({
  dataModel,
  tableName,
  useApiName,
  showAll,
  value,
  fieldConfigs,
  layout = 'horizontal',
  ...descriptionProps
}: DataDetailProps) {
  const [record, setRecord] = useState<Record<string, any>>()
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
      setRecord(record)
    } catch (error) {
      throw error
    } finally {
      setRecordLoading(false)
    }
  })

  useEffect(() => {
    if (typeof value !== 'string' && typeof value !== 'number') {
      setRecord(value || {})
    } else {
      getRecordById(60)(value)
    }
  }, [value, crud])

  const items: DescriptionsProps['items'] = useMemo(() => {
    const fields = (table?.fields || []).map((field) => {
      const name = useApiName ? field.apiName : field.name
      const config = fieldConfigs?.[name] || {}

      const Render =
        config.Render || fieldPlugin.getPlugin(field.type).getDisplayRender?.()

      return {
        key: name,
        label: config.label || field.label,
        span: config.span,
        order: config.order || field.order,
        children: Render ? (
          <Render
            field={field}
            dataModel={dataModel}
            useApiName={useApiName}
            value={record?.[name]}
          />
        ) : (
          <span>{record?.[name]}</span>
        ),
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

    return fields.filter((field) => configFields.includes(field.key))
  }, [dataModel, showAll, fieldConfigs, useApiName, table, record])

  return (
    <Spin spinning={schemaLoading || recordLoading}>
      <Descriptions {...descriptionProps} layout={layout} items={items} />
    </Spin>
  )
}
