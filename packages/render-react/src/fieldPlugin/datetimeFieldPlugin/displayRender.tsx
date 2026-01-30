import { DataModel } from '@shuttle-data/type'
import dayjs from 'dayjs'
import LongText from '../../components/longText'

export default function DateTimeDisplayRender({
  field,
  value,
  ...spanProps
}: DataModel.Render.DisplayRenderProps<'datetime', string> & {
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <LongText
      {...spanProps}
      text={
        value
          ? dayjs(value).format(field.extra?.format || 'YYYY-MM-DD HH:mm:ss')
          : '-'
      }
    />
  )
}
