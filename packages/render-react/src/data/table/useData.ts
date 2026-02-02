import { useCallback, useEffect, useMemo, useState } from 'react'
import { DataModel, DataCondition, DataCRUD } from '@shuttle-data/type'
import { DataModel as DataModelInstance } from '@shuttle-data/client'
import { TableColumnsType, TablePaginationConfig } from 'antd'

import useRefDebounce from '../../hooks/useRefDebounce'
import { isGroupColumn } from './utils'

interface UseDataOptions {
  dataModel: DataModelInstance
  baseColumns?: TableColumnsType
  showAll?: boolean
  table?: DataModel.Define
  useApiName?: boolean
  pagination?: TablePaginationConfig
  condition?: DataCondition.Define<Record<string, any>>
  orders?: DataCRUD.OrderBy<Record<string, any>>[]
}

export default function useData({
  dataModel,
  baseColumns,
  showAll,
  table,
  useApiName,
  pagination,
  condition,
  orders,
}: UseDataOptions) {
  const [data, setData] = useState<Record<string, any>[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState({
    current: 1,
    pageSize: 20,
  })
  const [total, setTotal] = useState(0)

  const needRequestColumns = useMemo(() => {
    const tableFields =
      table?.fields?.map((field) =>
        useApiName ? field.apiName : field.name,
      ) || []

    if (showAll) return tableFields

    const dataIndexList = findDataIndexFromColumn(baseColumns || [])

    const inTableDataIndex = dataIndexList.filter((index) =>
      tableFields.includes(index),
    )
    if (inTableDataIndex.length === 0) {
      return tableFields
    }
    return inTableDataIndex
  }, [table, baseColumns, useApiName, showAll])

  const handleChangePage = useCallback((page: number, pageSize: number) => {
    setPage({
      current: page,
      pageSize,
    })
  }, [])

  const showPagination: TablePaginationConfig = useMemo(
    () => ({
      ...pagination,
      current: page.current,
      pageSize: page.pageSize,
      total,
      onChange: handleChangePage,
    }),
    [pagination, page, total, handleChangePage],
  )

  const fetchData = useRefDebounce(async () => {
    if (!table || needRequestColumns.length === 0) return

    const crud = dataModel.crud({
      modelName: useApiName ? table.apiName : table.name,
      useApiName,
    })

    setLoading(true)
    try {
      const [data, count] = await Promise.all([
        crud.find({
          fields: needRequestColumns,
          limit: page.pageSize,
          offset: (page.current - 1) * page.pageSize,
          condition,
          orders: orders,
        }),
        crud.count({
          condition,
        }),
      ])

      setData(data)
      setTotal(count)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    setData([])
    setPage({
      current: 1,
      pageSize: 20,
    })
    setTotal(0)
  }, [needRequestColumns, condition, orders])

  useEffect(() => {
    fetchData(60)()
  }, [page, table, useApiName, needRequestColumns, condition, orders])

  return {
    showPagination,
    data,
    loading,
  }
}

function findDataIndexFromColumn(columns: TableColumnsType): string[] {
  const dataIndexList: string[] = []

  columns.forEach((column) => {
    if (isGroupColumn(column)) {
      dataIndexList.push(...findDataIndexFromColumn(column.children))
    } else if (typeof column.dataIndex === 'string') {
      dataIndexList.push(column.dataIndex)
    }
  })

  return dataIndexList
}
