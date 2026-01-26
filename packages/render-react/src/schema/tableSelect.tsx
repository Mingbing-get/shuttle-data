import { useState, useEffect } from 'react'
import { Select, SelectProps } from 'antd'
import { DataModelSchema } from '@shuttle-data/client'

import { useTableList } from './hooks'

export interface TableSelectProps extends Omit<
  SelectProps,
  'options' | 'loading'
> {
  schema: DataModelSchema
  useApiName?: boolean
}

export default function TableSelect({
  schema,
  useApiName,
  ...rest
}: TableSelectProps) {
  const { loading, tableList } = useTableList(schema)
  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    setOptions(
      tableList.map((item) => ({
        label: item.label || item.apiName,
        value: useApiName ? item.apiName : item.name,
      })),
    )
  }, [tableList, useApiName])

  return <Select {...rest} loading={loading} options={options} />
}
