import { useCallback, useMemo, useState } from 'react'
import { TableColumnsType, TableColumnType } from 'antd'
import { DataModel as NDataModel } from '@shuttle-data/type'
import { DataModel } from '@shuttle-data/client'

import fieldPlugin from '../../fieldPlugin'
import { isGroupColumn, generateKey } from './utils'

export interface ColumnConfig {
  hidden?: boolean
  width?: number
  fixed?: 'left' | 'right'
}

export interface UseColumnsOptions {
  dataModel: DataModel
  baseColumns?: TableColumnsType
  table?: NDataModel.Define
  useApiName?: boolean
  showAll?: boolean
}

export default function useColumns({
  dataModel,
  baseColumns,
  table,
  useApiName,
  showAll,
}: UseColumnsOptions) {
  const [columnsConfig, setColumnsConfig] = useState<
    Record<string, ColumnConfig>
  >({})

  const hasKeyColumns = useMemo(
    () => fillKeyColumns(baseColumns || []),
    [baseColumns],
  )

  const tableColumns = useMemo(() => {
    if (!table) return []

    const columns: TableColumnType[] = table.fields
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((field) => {
        const CellRender = fieldPlugin
          .getPlugin(field.type)
          .getDisplayRender?.()

        return {
          key: field.name,
          title: field.label,
          dataIndex: useApiName ? field.apiName : field.name,
          minWidth: 240,
          render: CellRender
            ? (v) => (
                <CellRender
                  value={v}
                  field={field}
                  dataModel={dataModel}
                  useApiName={useApiName}
                />
              )
            : undefined,
        }
      })

    return columns
  }, [table, useApiName, dataModel])

  const columns = useMemo(() => {
    const { afterMergeBaseColumns, usedColumnNames } = mergeColumns(
      hasKeyColumns,
      tableColumns,
      columnsConfig,
    )

    if (!showAll && usedColumnNames.length > 0) {
      return afterMergeBaseColumns
    }

    const mergeConfigTableColumns: TableColumnType[] = tableColumns
      .filter((column) => !usedColumnNames.includes(column.dataIndex as string))
      .map((column) => ({
        ...column,
        ...columnsConfig[column.key as string],
      }))

    return [...mergeConfigTableColumns, ...afterMergeBaseColumns]
  }, [hasKeyColumns, tableColumns, columnsConfig, showAll])

  const updateColumnConfig = useCallback(
    <K extends keyof ColumnConfig>(
      columnKey: string,
      k: K,
      v: ColumnConfig[K],
    ) => {
      setColumnsConfig((prev) => ({
        ...prev,
        [columnKey]: {
          ...prev[columnKey],
          [k]: v,
        },
      }))
    },
    [],
  )

  return {
    columns,
    updateColumnConfig,
  }
}

function fillKeyColumns(columns: TableColumnsType): TableColumnsType {
  return columns.map((column) => {
    if (isGroupColumn(column)) {
      return {
        ...column,
        key: column.key || generateKey(),
        children: fillKeyColumns(column.children),
      }
    }

    return {
      ...column,
      key: column.key || generateKey(),
    }
  })
}

function mergeColumns(
  baseColumns: TableColumnsType,
  tableColumns: TableColumnType[],
  columnsConfig: Record<string, ColumnConfig>,
): {
  afterMergeBaseColumns: TableColumnsType
  usedColumnNames: string[]
} {
  let usedColumnNames: string[] = []

  const afterMergeBaseColumns: TableColumnsType = baseColumns.map((column) => {
    if (isGroupColumn(column)) {
      const childrenInfo = mergeColumns(
        column.children,
        tableColumns,
        columnsConfig,
      )

      usedColumnNames.push(...childrenInfo.usedColumnNames)

      return {
        minWidth: childrenInfo.afterMergeBaseColumns.reduce((acc, item) => {
          return acc + (item.minWidth || 240)
        }, 0),
        ...column,
        ...columnsConfig[column.key as string],
        children: childrenInfo.afterMergeBaseColumns,
      }
    }

    const tableColumn = tableColumns.find(
      (item) => item.dataIndex === column.dataIndex,
    )

    if (tableColumn) {
      usedColumnNames.push(tableColumn.dataIndex as string)
    }

    return {
      ...tableColumn,
      ...column,
      ...columnsConfig[column.key as string],
    }
  })

  return {
    afterMergeBaseColumns,
    usedColumnNames,
  }
}
