import { useMemo } from 'react'
import { DataModel } from '@shuttle-data/type'
import {
  DataEnumItemSelect,
  DataEnumItemSelectProps,
  useGroup,
} from '../../dataEnum'

export interface EnumInputRenderExtraProps extends Omit<
  DataEnumItemSelectProps,
  'value' | 'onChange' | 'manager' | 'groupName' | 'mode' | 'useApiName'
> {}

export interface EnumFormInputRenderProps
  extends
    DataModel.Render.FormInputRenderProps<'enum', string | string[]>,
    EnumInputRenderExtraProps {}

export default function EnumFormInputRender({
  field,
  dataModel,
  value,
  onChange,
  useApiName,
  ...selectProps
}: EnumFormInputRenderProps) {
  const { group } = useGroup(
    dataModel.enumManager,
    field.extra?.groupName || '',
  )

  const groupName = useMemo(() => {
    return useApiName ? group?.apiName : group?.name
  }, [useApiName, group])

  return (
    <DataEnumItemSelect
      {...selectProps}
      mode={field.extra?.multiple ? 'multiple' : undefined}
      manager={dataModel.enumManager}
      groupName={groupName || ''}
      useApiName={useApiName}
      value={value}
      onChange={onChange}
    />
  )
}
