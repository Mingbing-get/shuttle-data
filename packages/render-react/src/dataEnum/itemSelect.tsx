import { useState, useEffect } from 'react'
import { Select, Radio, Checkbox, SelectProps, RadioGroupProps } from 'antd'
import { CheckboxGroupProps } from 'antd/es/checkbox'
import { DataEnumManager } from '@shuttle-data/client'

import { useGroup } from './hooks'

export interface ItemSelectProps {
  manager: DataEnumManager
  groupName: string
  useApiName?: boolean
  selectProps?: Omit<SelectProps, 'options' | 'loading'>
  radioGroupProps?: Omit<RadioGroupProps, 'options'>
  checkboxGroupProps?: Omit<CheckboxGroupProps, 'options'>
}

export default function ItemSelect({
  manager,
  groupName,
  useApiName,
  selectProps,
  radioGroupProps,
  checkboxGroupProps,
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

  if (radioGroupProps) {
    return <Radio.Group {...radioGroupProps} options={options} />
  }

  if (checkboxGroupProps) {
    return <Checkbox.Group {...checkboxGroupProps} options={options} />
  }

  return <Select {...selectProps} loading={loading} options={options} />
}
