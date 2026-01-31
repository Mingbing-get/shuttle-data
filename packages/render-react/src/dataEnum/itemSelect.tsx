import { useState, useEffect, useCallback } from 'react'
import {
  Select,
  Radio,
  Checkbox,
  SelectProps,
  RadioGroupProps,
  Tag,
} from 'antd'
import { CheckboxGroupProps } from 'antd/es/checkbox'
import { DataEnumManager } from '@shuttle-data/client'

import { useGroup } from './hooks'

export interface DataEnumItemSelectProps extends Omit<
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
}: DataEnumItemSelectProps) {
  const { loading, group } = useGroup(manager, groupName, useApiName)
  const [options, setOptions] = useState<
    { value: string; label: string; color?: string }[]
  >([])

  useEffect(() => {
    setOptions(
      group?.items?.map((item) => ({
        label: item.label || item.apiName,
        value: useApiName ? item.apiName : item.name,
        color: item.color,
      })) || [],
    )
  }, [group, useApiName])

  const getColor = useCallback(
    (value: string) => {
      const option = options.find((item) => item.value === value)
      return option?.color
    },
    [options],
  )

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
      optionRender={(option) => (
        <Tag color={option.data.color}>{option.label}</Tag>
      )}
      tagRender={(tagProps) => (
        <Tag
          {...tagProps}
          className="ant-select-selection-item"
          color={getColor(tagProps.value)}
        >
          {tagProps.label}
        </Tag>
      )}
    />
  )
}
