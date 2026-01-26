import { useState, useEffect } from 'react'
import { Select, Radio, Checkbox, SelectProps, RadioGroupProps } from 'antd'
import { CheckboxGroupProps } from 'antd/es/checkbox'
import { DataEnumManager } from '@shuttle-data/client'

import { useGroup } from './hooks'

export interface ItemSelectProps extends Omit<
  SelectProps,
  'options' | 'loading'
> {
  manager: DataEnumManager
  groupName: string
  useApiName?: boolean
  radioGroupProps?: Omit<RadioGroupProps, keyof SelectProps>
  checkboxGroupProps?: Omit<CheckboxGroupProps, keyof SelectProps>
  showAs?: 'radio' | 'checkbox' | 'select'
}

export default function ItemSelect({
  manager,
  groupName,
  useApiName,
  radioGroupProps,
  checkboxGroupProps,
  showAs = 'select',
  value,
  onChange,
  mode,
  ...extraProps
}: ItemSelectProps) {
  const { loading, group } = useGroup(manager, groupName, useApiName)
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    setOptions(
      group?.items?.map((item) => ({
        label: item.label || item.apiName,
        value: useApiName ? item.apiName : item.name,
      })) || [],
    )
  }, [group, useApiName])

  if (mode !== 'multiple' && showAs === 'radio') {
    return (
      <Radio.Group
        {...radioGroupProps}
        {...extraProps}
        options={options}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    )
  }

  if (mode === 'multiple' && showAs === 'checkbox') {
    return (
      <Checkbox.Group
        {...checkboxGroupProps}
        {...extraProps}
        options={options}
        value={value}
        onChange={onChange}
      />
    )
  }

  return (
    <Select
      {...extraProps}
      mode={mode}
      loading={loading}
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}
