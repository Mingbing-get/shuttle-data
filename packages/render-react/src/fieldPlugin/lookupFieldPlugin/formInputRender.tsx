import { DataModel, DataCRUD } from '@shuttle-data/type'

import { RecordSelect, DataRecordSelectProps } from '../../data'

export interface LookupInputRenderExtraProps extends Omit<
  DataRecordSelectProps,
  'value' | 'onChange' | 'tableName' | 'multiple' | 'useApiName'
> {}

export interface LookupFormInputRenderProps
  extends
    DataModel.Render.FormInputRenderProps<
      'lookup',
      DataCRUD.LookupInRecord | DataCRUD.LookupInRecord[]
    >,
    LookupInputRenderExtraProps {}

export default function LookupFormInputRender({
  field,
  value,
  onChange,
  useApiName,
  ...selectProps
}: LookupFormInputRenderProps) {
  return (
    <RecordSelect
      {...selectProps}
      tableName={field.extra?.modalName || ''}
      useApiName={false}
      multiple={field.extra?.multiple || false}
      value={value as any}
      onChange={onChange}
    />
  )
}
