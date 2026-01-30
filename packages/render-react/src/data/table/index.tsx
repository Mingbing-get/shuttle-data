import { useMemo } from 'react'
import { Table, TableProps, TablePaginationConfig } from 'antd'
import { DataModel } from '@shuttle-data/client'

import { useTable } from '../../schema'
import useColumns from './useColumns'
import useData from './useData'

export interface DataTableProps extends Omit<
  TableProps,
  'dataSource' | 'pagination' | 'loading'
> {
  dataModel: DataModel
  tableName: string
  headerBlock?: () => React.ReactNode
  useApiName?: boolean
  pagination?: TablePaginationConfig
  showAll?: boolean
}

export default function DataTable({
  headerBlock,
  dataModel,
  tableName,
  useApiName,
  columns,
  pagination,
  scroll,
  showAll,
  ...tableProps
}: DataTableProps) {
  const { table, loading: schemaLoading } = useTable(
    dataModel.schema,
    tableName,
    useApiName,
  )

  const { columns: mergedColumns, updateColumnConfig } = useColumns({
    dataModel,
    baseColumns: columns,
    table,
    useApiName,
    showAll,
  })

  const {
    showPagination,
    data,
    loading: dataLoading,
  } = useData({
    dataModel,
    baseColumns: columns,
    table,
    useApiName,
    pagination,
  })

  const computedScroll = useMemo(() => {
    if (scroll?.x) return scroll

    const x = mergedColumns.reduce((acc: number, column) => {
      return acc + (column.minWidth || 240)
    }, 0)

    return { ...scroll, x }
  }, [scroll, mergedColumns])

  return (
    <>
      {headerBlock?.()}
      <Table<any>
        {...tableProps}
        scroll={computedScroll}
        dataSource={data}
        columns={mergedColumns}
        pagination={showPagination}
        loading={schemaLoading || dataLoading}
      />
    </>
  )
}
