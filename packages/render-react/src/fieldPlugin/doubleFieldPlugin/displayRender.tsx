import { DataModel } from '@shuttle-data/type'
import { useMemo } from 'react'

export default function DoubleDisplayRender({
  dataModel,
  useApiName,
  field,
  value,
  ...spanProps
}: DataModel.Render.DisplayRenderProps<'double', number> & {
  style?: React.CSSProperties
  className?: string
}) {
  const valueText = useMemo(() => {
    if (value === undefined || value === null) return '-'

    if (field.extra?.decimal === undefined || field.extra?.decimal === null) {
      return value
    }

    return value.toFixed(field.extra?.decimal)
  }, [field, value])

  return <span {...spanProps}>{valueText}</span>
}
