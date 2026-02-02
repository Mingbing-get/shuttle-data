import { useMemo } from 'react'
import { DataCRUD, DataModel } from '@shuttle-data/type'

import LookupFormInputRender, {
  LookupInputRenderExtraProps,
} from './formInputRender'

export interface LookupConditionInputRenderProps
  extends
    DataModel.Render.ConditionInputRenderProps<
      'lookup',
      DataCRUD.LookupInRecord | DataCRUD.LookupInRecord[]
    >,
    LookupInputRenderExtraProps {}

export default function LookupConditionInputRender({
  op,
  field,
  ...inputProps
}: LookupConditionInputRenderProps) {
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
    return <LookupFormInputRender {...inputProps} field={factField} />
  }

  return null
}
