import { useState, useEffect } from 'react'
import { Select, Radio, Checkbox, SelectProps, RadioGroupProps } from 'antd'
import { CheckboxGroupProps } from 'antd/es/checkbox'
import { DataModel, dataModelManager } from '@shuttle-data/type'

export interface FieldTypeSelectProps extends Omit<
  SelectProps,
  'options' | 'loading'
> {
  radioGroupProps?: Omit<RadioGroupProps, keyof SelectProps>
  checkboxGroupProps?: Omit<CheckboxGroupProps, keyof SelectProps>
  showAs?: 'radio' | 'checkbox' | 'select'
}

export default function FieldTypeSelect({
  value,
  onChange,
  radioGroupProps,
  checkboxGroupProps,
  showAs = 'select',
  mode,
  ...extraProps
}: FieldTypeSelectProps) {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    const plugins = dataModelManager.getPlugins()
    setOptions(
      plugins.map((plugin) => ({
        label: plugin.label,
        value: plugin.type,
      })),
    )
  }, [])

  if (mode !== 'multiple' && showAs === 'radio') {
    return (
      <Radio.Group
        {...extraProps}
        {...radioGroupProps}
        value={value}
        onChange={(e) => onChange?.(e.target.value as DataModel.FieldType)}
        options={options}
      />
    )
  }

  if (mode === 'multiple' && showAs === 'checkbox') {
    return (
      <Checkbox.Group
        {...extraProps}
        {...checkboxGroupProps}
        value={value as DataModel.FieldType[]}
        onChange={onChange}
        options={options as any}
      />
    )
  }

  return (
    <Select
      {...extraProps}
      mode={mode}
      value={value}
      onChange={onChange}
      options={options}
    />
  )
}
