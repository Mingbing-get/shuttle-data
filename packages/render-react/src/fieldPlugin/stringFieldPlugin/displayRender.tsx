import { DataModel } from '@shuttle-data/type'
import LongText from '../../components/longText'

export default function StringDisplayRender({
  dataModel,
  useApiName,
  field,
  value,
  ...spanProps
}: DataModel.Render.DisplayRenderProps<'string', string> & {
  style?: React.CSSProperties
  className?: string
}) {
  return <LongText {...spanProps} text={value} />
}
