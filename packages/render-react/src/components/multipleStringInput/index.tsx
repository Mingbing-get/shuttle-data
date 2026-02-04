import { Select, SelectProps } from 'antd'

export interface MultipleSelectProps extends Pick<
  SelectProps,
  | 'allowClear'
  | 'autoFocus'
  | 'bordered'
  | 'children'
  | 'className'
  | 'style'
  | 'clearIcon'
  | 'defaultValue'
  | 'disabled'
  | 'maxCount'
  | 'maxLength'
  | 'maxTagCount'
  | 'onBlur'
  | 'onClear'
  | 'onClick'
  | 'onFocus'
  | 'onInputKeyDown'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onMouseDown'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'tokenSeparators'
  | 'size'
  | 'prefix'
  | 'prefixCls'
  | 'suffix'
  | 'suffixIcon'
  | 'tagRender'
  | 'status'
  | 'tabIndex'
> {}

export interface MultipleStringInputProps extends MultipleSelectProps {
  value?: string[]
  onChange?: (value?: string[] | null) => void
}

export default function MultipleStringInput({
  tokenSeparators = [' '],
  value,
  onChange,
  ...extraProps
}: MultipleStringInputProps) {
  return (
    <Select
      {...extraProps}
      open={false}
      mode="tags"
      tokenSeparators={tokenSeparators}
      value={value}
      onChange={onChange}
      suffixIcon={null}
    />
  )
}
