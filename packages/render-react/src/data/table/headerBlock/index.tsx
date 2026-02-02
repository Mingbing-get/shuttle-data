import { HeaderBlockContext } from '..'

import ColumnsConfig from './columnsConfig'
import Order from './order'

import './index.scss'

export default function HeaderBlock({
  table,
  columns,
  condition,
  orders,
  useApiName,
  updateCondition,
  updateOrders,
  updateColumnConfig,
}: HeaderBlockContext) {
  return (
    <div className="shuttle-data-table-header-actions">
      <Order
        table={table}
        columns={columns}
        useApiName={useApiName}
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
