import { DataModel } from '@shuttle-data/type'

import BooleanFormInputRender, {
  BooleanInputRenderExtraProps,
} from './formInputRender'

export interface BooleanConditionInputRenderProps
  extends
    DataModel.Render.ConditionInputRenderProps<'boolean', boolean>,
    BooleanInputRenderExtraProps {}

export default function BooleanConditionInputRender({
  op,
  ...inputProps
}: BooleanConditionInputRenderProps) {
  if (op === 'eq' || op === 'neq') {
    return <BooleanFormInputRender {...inputProps} />
  }

  return null
}
