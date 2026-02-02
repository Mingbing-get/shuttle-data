import { DataModel } from '@shuttle-data/type'

import StringFormInputRender, {
  StringFormInputRenderExtraProps,
} from './formInputRender'

export interface StringConditionInputRenderProps
  extends
    DataModel.Render.ConditionInputRenderProps<'string', string>,
    StringFormInputRenderExtraProps {}

export default function StringConditionInputRender({
  op,
  ...inputProps
}: StringConditionInputRenderProps) {
  if (
    op === 'eq' ||
    op === 'neq' ||
    op === 'like' ||
    op === 'notLike' ||
    op === 'in' ||
    op === 'notIn'
  ) {
    return <StringFormInputRender {...inputProps} />
  }

  return null
}
