import { useState, useEffect } from 'react'
import { Select, Radio, Checkbox, SelectProps, RadioGroupProps } from 'antd'
import { CheckboxGroupProps } from 'antd/es/checkbox'
import { DataModelSchema } from '@shuttle-data/client'

import { useTable } from './hooks'

export interface FieldSelectProps {
  schema: DataModelSchema
  tableName: string
  useApiName?: boolean
  selectProps?: Omit<SelectProps, 'options' | 'loading'>
  radioGroupProps?: Omit<RadioGroupProps, 'options'>
  checkboxGroupProps?: Omit<CheckboxGroupProps, 'options'>
}

export default function FieldSelect({
  schema,
  tableName,
  useApiName,
  selectProps,
  radioGroupProps,
  checkboxGroupProps,
}: FieldSelectProps) {
  const { loading, table } = useTable(schema, tableName, useApiName)
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    setOptions(
      table?.fields?.map((item) => ({
        label: item.label || item.apiName,
        value: useApiName ? item.apiName : item.name,
      })) || [],
    )
  }, [table, useApiName])

  if (radioGroupProps) {
    return <Radio.Group {...radioGroupProps} options={options} />
  }

  if (checkboxGroupProps) {
    return <Checkbox.Group {...checkboxGroupProps} options={options} />
  }

  return <Select {...selectProps} loading={loading} options={options} />
}
