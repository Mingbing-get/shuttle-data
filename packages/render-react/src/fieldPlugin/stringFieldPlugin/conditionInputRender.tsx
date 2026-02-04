import { DataModel } from '@shuttle-data/type'

import MultipleStringInput from '../../components/multipleStringInput'
import StringFormInputRender, {
  StringFormInputRenderExtraProps,
} from './formInputRender'

export interface StringConditionInputRenderProps
  extends
    DataModel.Render.ConditionInputRenderProps<'string', string | string[]>,
    StringFormInputRenderExtraProps {}

export default function StringConditionInputRender({
  op,
  ...inputProps
}: StringConditionInputRenderProps) {
  if (op === 'eq' || op === 'neq' || op === 'like' || op === 'notLike') {
    return <StringFormInputRender {...(inputProps as any)} />
  }

  if (op === 'in' || op === 'notIn') {
    return <MultipleStringInput {...(inputProps as any)} />
  }

  return null
}
