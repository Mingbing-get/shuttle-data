import { useState, useEffect } from 'react'
import { Select, SelectProps } from 'antd'
import { DataEnumManager } from '@shuttle-data/client'

import { useGroupList } from './hooks'

export interface GroupSelectProps extends Omit<
  SelectProps,
  'options' | 'loading'
> {
  manager: DataEnumManager
  useApiName?: boolean
}

export default function GroupSelect({
  manager,
  useApiName,
  ...rest
}: GroupSelectProps) {
  const { loading, groupList } = useGroupList(manager)
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    setOptions(
      groupList.map((item) => ({
        label: item.label || item.apiName,
        value: useApiName ? item.apiName : item.name,
      })),
    )
  }, [groupList, useApiName])

  return <Select {...rest} loading={loading} options={options} />
}
