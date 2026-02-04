import { DataModel } from '@shuttle-data/type'

import MultipleNumberInput from '../../components/mutipleNumberInput'
import NumberFormInputRender, {
  NumberInputRenderExtraProps,
} from './formInputRender'

export interface NumberConditionInputRenderProps
  extends
    DataModel.Render.ConditionInputRenderProps<'number', number>,
    NumberInputRenderExtraProps {}

export default function NumberConditionInputRender({
  op,
  ...inputProps
}: NumberConditionInputRenderProps) {
  if (
    op === 'eq' ||
    op === 'neq' ||
    op === 'gt' ||
    op === 'lt' ||
    op === 'gte' ||
    op === 'lte'
  ) {
    return <NumberFormInputRender {...inputProps} />
  }

  if (op === 'in' || op === 'notIn') {
    return <MultipleNumberInput {...(inputProps as any)} />
  }

  return null
}
