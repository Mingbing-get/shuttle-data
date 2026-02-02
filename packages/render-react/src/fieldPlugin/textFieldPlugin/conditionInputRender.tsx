import { DataModel } from '@shuttle-data/type'

import TextFormInputRender, {
  TextFormInputRenderExtraProps,
} from './formInputRender'

export interface TextConditionInputRenderProps
  extends
    DataModel.Render.ConditionInputRenderProps<'text', string>,
    TextFormInputRenderExtraProps {}

export default function TextConditionInputRender({
  op,
  ...inputProps
}: TextConditionInputRenderProps) {
  if (op === 'eq' || op === 'neq' || op === 'like' || op === 'notLike') {
    return <TextFormInputRender {...inputProps} />
  }

  return null
}
