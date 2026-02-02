import { DataModel } from '@shuttle-data/type'

import DoubleFormInputRender, {
  DoubleInputRenderExtraProps,
} from './formInputRender'

export interface DoubleConditionInputRenderProps
  extends
    DataModel.Render.ConditionInputRenderProps<'double', number>,
    DoubleInputRenderExtraProps {}

export default function DoubleConditionInputRender({
  op,
  ...inputProps
}: DoubleConditionInputRenderProps) {
  if (
    op === 'eq' ||
    op === 'neq' ||
    op === 'gt' ||
    op === 'lt' ||
    op === 'gte' ||
    op === 'lte'
  ) {
    return <DoubleFormInputRender {...inputProps} />
  }

  return null
}
