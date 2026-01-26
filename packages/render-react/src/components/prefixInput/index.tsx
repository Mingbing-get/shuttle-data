import { Input, InputProps, Space } from 'antd'
import { useCallback, useMemo } from 'react'

interface Props extends Omit<InputProps, 'prefix' | 'value'> {
  prefix?: string
  value?: string
}

export default function PrefixInput({
  prefix,
  value,
  onChange,
  ...rest
}: Props) {
  const omitPrefixValue = useMemo(() => {
    if (!prefix || !value?.startsWith(prefix)) return value

    return value.slice(prefix.length)
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!prefix || !e.target.value) {
        onChange?.(e)
        return
      }

      onChange?.({
        ...e,
        target: {
          ...e.target,
          value: prefix + e.target.value,
        },
      })
    },
    [onChange, prefix],
  )

  if (!prefix) {
    return <Input {...rest} value={value} onChange={onChange} />
  }

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Space.Addon>{prefix}</Space.Addon>
      <Input {...rest} value={omitPrefixValue} onChange={handleChange} />
    </Space.Compact>
  )
}
