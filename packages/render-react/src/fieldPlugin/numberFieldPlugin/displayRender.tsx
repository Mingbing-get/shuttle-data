import { DataModel } from '@shuttle-data/type'
import { useMemo } from 'react'

export default function NumberDisplayRender({
  field,
  value,
  ...spanProps
}: DataModel.Render.DisplayRenderProps<'number', number> & {
  style?: React.CSSProperties
  className?: string
}) {
  const valueText = useMemo(() => {
    if (value === undefined || value === null) return '-'

    return Math[field.extra?.func || 'round'](value)
  }, [field, value])

  return <span {...spanProps}>{valueText}</span>
}
