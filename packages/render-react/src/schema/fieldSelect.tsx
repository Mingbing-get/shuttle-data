import { useState, useEffect } from 'react'
import { Select, Radio, Checkbox, SelectProps, RadioGroupProps } from 'antd'
import { CheckboxGroupProps } from 'antd/es/checkbox'
import { DataModelSchema } from '@shuttle-data/client'

import { useTable } from './hooks'

export interface FieldSelectProps extends Omit<
  SelectProps,
  'options' | 'loading'
> {
  schema: DataModelSchema
  tableName: string
  useApiName?: boolean
  radioGroupProps?: Omit<RadioGroupProps, keyof SelectProps>
  checkboxGroupProps?: Omit<CheckboxGroupProps, keyof SelectProps>
  showAs?: 'radio' | 'checkbox' | 'select'
}

export default function FieldSelect({
  schema,
  tableName,
  useApiName,
  radioGroupProps,
  checkboxGroupProps,
  showAs = 'select',
  value,
  onChange,
  mode,
  ...selectProps
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

  if (mode !== 'multiple' && showAs === 'radio') {
    return (
      <Radio.Group
        {...radioGroupProps}
        {...selectProps}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        options={options}
      />
    )
  }

  if (mode === 'multiple' && showAs === 'checkbox') {
    return (
      <Checkbox.Group
        {...checkboxGroupProps}
        {...selectProps}
        value={value}
        onChange={onChange}
        options={options}
      />
    )
  }

  return (
    <Select
      {...selectProps}
      mode={mode}
      value={value}
      onChange={onChange}
      loading={loading}
      options={options}
    />
  )
}
