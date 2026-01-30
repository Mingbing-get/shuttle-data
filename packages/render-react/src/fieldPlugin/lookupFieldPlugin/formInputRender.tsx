import { DataModel, DataCRUD } from '@shuttle-data/type'

import { RecordSelect, DataRecordSelectProps } from '../../data'

export default function LookupFormInputRender({
  field,
  value,
  onChange,
  useApiName,
  ...selectProps
}: DataModel.Render.FormInputRenderProps<
  'lookup',
  DataCRUD.LookupInRecord | DataCRUD.LookupInRecord[]
> &
  Omit<
    DataRecordSelectProps,
    'value' | 'onChange' | 'tableName' | 'multiple' | 'useApiName'
  >) {
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
