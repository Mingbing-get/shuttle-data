import { useCallback, useState } from 'react'
import { Select } from 'antd'
import { MultipleSelectProps } from '../multipleStringInput'

export interface MultipleNumberInputProps extends MultipleSelectProps {
  value?: number[]
  supportFloat?: boolean
  onChange?: (value?: number[] | null) => void
}

export default function MultipleNumberInput({
  tokenSeparators = [' '],
  supportFloat,
  value,
  onChange,
  ...extraProps
}: MultipleNumberInputProps) {
  const [state, setState] = useState(value)

  const handleChange = useCallback(
    (value?: string[] | null) => {
      const numValues =
        value?.map((v) => Number(v)).filter((v) => !isNaN(v)) || []
      setState(numValues)
      onChange?.(numValues)
    },
    [onChange],
  )

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!/[0-9\s]/.test(e.key) || (supportFloat && e.key === '.')) {
        e.preventDefault()
      }
    },
    [supportFloat],
  )

  return (
    <Select
      {...extraProps}
      open={false}
      mode="tags"
      tokenSeparators={tokenSeparators}
      value={state as any}
      onChange={handleChange}
      onInputKeyDown={handleInputKeyDown}
      suffixIcon={null}
    />
  )
}
