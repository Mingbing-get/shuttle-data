import { useMemo } from 'react'
import { DataModel } from '@shuttle-data/type'

import EnumFormInputRender, {
  EnumInputRenderExtraProps,
} from './formInputRender'

export interface EnumConditionInputRenderProps
  extends
    DataModel.Render.ConditionInputRenderProps<'enum', string | string[]>,
    EnumInputRenderExtraProps {}

export default function EnumConditionInputRender({
  op,
  field,
  ...inputProps
}: EnumConditionInputRenderProps) {
  const factField = useMemo(
    () => ({
      ...field,
      extra: {
        ...field.extra,
        multiple:
          op === 'hasAnyOf' ||
          op === 'notAnyOf' ||
          op === 'in' ||
          op === 'notIn',
      } as any,
    }),
    [field, op],
  )

  if (
    op === 'eq' ||
    op === 'neq' ||
    op === 'in' ||
    op === 'notIn' ||
    op === 'contains' ||
    op === 'notContains' ||
    op === 'hasAnyOf' ||
    op === 'notAnyOf'
  ) {
    return <EnumFormInputRender {...inputProps} field={factField} />
  }

  return null
}
