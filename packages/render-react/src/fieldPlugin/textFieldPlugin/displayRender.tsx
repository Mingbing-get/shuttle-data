import { DataModel } from '@shuttle-data/type'
import LongText from '../../components/longText'

export default function TextDisplayRender({
  field,
  value,
  ...spanProps
}: DataModel.Render.DisplayRenderProps<'text', string> & {
  style?: React.CSSProperties
  className?: string
}) {
  return <LongText {...spanProps} text={value} />
}
