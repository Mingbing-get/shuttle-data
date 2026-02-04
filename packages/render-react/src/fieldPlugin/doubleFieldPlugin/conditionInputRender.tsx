import { DataModel } from '@shuttle-data/type'

import MultipleNumberInput from '../../components/mutipleNumberInput'
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

  if (op === 'in' || op === 'notIn') {
    return <MultipleNumberInput {...(inputProps as any)} supportFloat />
  }

  return null
}
