import { useMemo } from 'react'
import { DataModel as NDataModel } from '@shuttle-data/type'

import { HeaderBlockContext } from '..'
import ColumnsConfig from './columnsConfig'
import Order from './order'
import Condition from './condition'
import { isGroupColumn } from '../utils'

import './index.scss'

export interface ColumnOption {
  value: string
  label?: React.ReactNode
  field: NDataModel.Field
}

export default function HeaderBlock({
  dataModel,
  table,
  columns,
  condition,
  orders,
  useApiName,
  updateCondition,
  updateOrders,
  updateColumnConfig,
}: HeaderBlockContext) {
  const columnOptions = useMemo(() => {
    return findDataFieldOptionsFromColumns({
      table,
      columns,
      useApiName,
    })
  }, [table, columns, useApiName])

  return (
    <div className="shuttle-data-table-header-actions">
      <Condition
        dataModel={dataModel}
        columnOptions={columnOptions}
        useApiName={useApiName}
        condition={condition}
        updateCondition={updateCondition}
      />
      <Order
        columnOptions={columnOptions}
        orders={orders}
        updateOrders={updateOrders}
      />
      <ColumnsConfig
        columns={columns}
        updateColumnConfig={updateColumnConfig}
      />
    </div>
  )
}

function findDataFieldOptionsFromColumns({
  columns,
  table,
  useApiName,
}: Pick<HeaderBlockContext, 'table' | 'columns' | 'useApiName'>) {
  const options: ColumnOption[] = []

  const willHandleColumns = [...columns]
  while (willHandleColumns.length > 0) {
    const first = willHandleColumns.pop()
    if (!first) break

    if (isGroupColumn(first)) {
      willHandleColumns.push(...first.children)
    } else {
      const field = table.fields.find((field) =>
        useApiName
          ? field.apiName === first.dataIndex
          : field.name === first.dataIndex,
      )
      if (field) {
        options.push({
          value: first.dataIndex as string,
          label: first.title as React.ReactNode,
          field,
        })
      }
    }
  }

  return options
}
