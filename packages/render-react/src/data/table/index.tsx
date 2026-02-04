import { useMemo, useState } from 'react'
import {
  Table,
  TableProps,
  TableColumnsType,
  TablePaginationConfig,
} from 'antd'
import { DataModel } from '@shuttle-data/client'
import {
  DataCondition,
  DataCRUD,
  DataModel as NDataModel,
} from '@shuttle-data/type'

import { useTable } from '../../schema'
import useColumns, { ColumnConfig } from './useColumns'
import useData from './useData'
import HeaderBlock from './headerBlock'

export interface HeaderBlockContext {
  dataModel: DataModel
  table: NDataModel.Define
  columns: TableColumnsType
  condition: DataCondition.Define<Record<string, any>> | undefined
  orders: DataCRUD.OrderBy<Record<string, any>>[]
  useApiName?: boolean
  updateCondition: (
    condition?: DataCondition.Define<Record<string, any>>,
  ) => void
  updateOrders: (orders: DataCRUD.OrderBy<Record<string, any>>[]) => void
  updateColumnConfig: <K extends keyof ColumnConfig>(
    columnKey: string,
    k: K,
    v: ColumnConfig[K],
  ) => void
}

export interface DataTableProps extends Omit<
  TableProps,
  'dataSource' | 'pagination' | 'loading'
> {
  dataModel: DataModel
  tableName: string
  headerBlock?: (
    context: HeaderBlockContext,
    actionRender: React.ReactNode,
  ) => React.ReactNode
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
  const [condition, setCondition] =
    useState<DataCondition.Define<Record<string, any>>>()
  const [orders, setOrders] = useState<DataCRUD.OrderBy<Record<string, any>>[]>(
    [],
  )

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
    showAll,
    table,
    useApiName,
    pagination,
    condition,
    orders,
  })

  const computedScroll = useMemo(() => {
    if (scroll?.x) return scroll

    const x = mergedColumns.reduce((acc: number, column) => {
      return acc + (column.minWidth || 240)
    }, 0)

    return { ...scroll, x }
  }, [scroll, mergedColumns])

  const header = useMemo(() => {
    if (!headerBlock || !table) return null

    const context: HeaderBlockContext = {
      dataModel,
      table,
      columns: mergedColumns,
      condition,
      orders,
      useApiName,
      updateCondition: setCondition,
      updateOrders: setOrders,
      updateColumnConfig,
    }

    return headerBlock(context, <HeaderBlock {...context} />)
  }, [
    headerBlock,
    dataModel,
    condition,
    orders,
    table,
    mergedColumns,
    useApiName,
  ])

  return (
    <>
      {header}
      <Table<any>
        {...tableProps}
        rowKey="_id"
        scroll={computedScroll}
        dataSource={data}
        columns={mergedColumns}
        pagination={showPagination}
        loading={schemaLoading || dataLoading}
      />
    </>
  )
}
