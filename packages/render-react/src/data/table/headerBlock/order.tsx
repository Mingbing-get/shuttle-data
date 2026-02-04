import { useCallback, useEffect, useState } from 'react'
import { Popover, Button, Flex, Divider } from 'antd'
import { SortAscendingOutlined } from '@ant-design/icons'
import { DataModel as NDataModel } from '@shuttle-data/type'

import { HeaderBlockContext } from '..'
import DataOrderRender, { OrderRenderFooterProps } from '../../order'

export default function Order({
  fields,
  useApiName,
  orders,
  updateOrders,
}: Pick<HeaderBlockContext, 'orders' | 'updateOrders' | 'useApiName'> & {
  fields: NDataModel.Field[]
}) {
  const [showPopover, setShowPopover] = useState(false)
  const [orderList, setOrderList] = useState(orders || [])

  useEffect(() => {
    if (!showPopover) {
      requestAnimationFrame(() => {
        setOrderList(orders)
      })
    }
  }, [showPopover, orders])

  const handleClear = useCallback(() => {
    updateOrders([])
    setOrderList([])
    setShowPopover(false)
  }, [updateOrders])

  const handleReset = useCallback(() => {
    setOrderList(orders)
  }, [orders])

  const handleConfirm = useCallback(() => {
    updateOrders(orderList)
    setShowPopover(false)
  }, [orderList, updateOrders])

  const FooterRender = useCallback(
    ({ defaultAdd }: OrderRenderFooterProps) => {
      return (
        <>
          {defaultAdd}
          <Divider style={{ margin: '0.5rem 0' }} />
          <Flex justify="center" gap={8}>
            <Button onClick={handleClear}>清空</Button>
            <Button onClick={handleReset}>重置</Button>
            <Button type="primary" onClick={handleConfirm}>
              确定
            </Button>
          </Flex>
        </>
      )
    },
    [handleClear, handleReset, handleConfirm],
  )

  return (
    <Popover
      open={showPopover}
      onOpenChange={setShowPopover}
      trigger="click"
      getPopupContainer={() => document.body}
      placement="bottomLeft"
      showArrow={false}
      content={
        <DataOrderRender
          className="shuttle-data-order-list"
          value={orderList}
          fields={fields}
          useApiName={useApiName}
          FooterRender={FooterRender}
          onChange={setOrderList}
        />
      }
    >
      <Button
        color={orderList.length > 0 ? 'primary' : 'default'}
        variant="outlined"
        icon={<SortAscendingOutlined />}
      />
    </Popover>
  )
}
