import { useCallback, useEffect, useState } from 'react'
import { Popover, Button, Radio, Tooltip, Select, Flex, Divider } from 'antd'
import { DeleteOutlined, SortAscendingOutlined } from '@ant-design/icons'
import { DataCRUD } from '@shuttle-data/type'

import { HeaderBlockContext } from '..'
import { ColumnOption } from '.'
import SortList, {
  RenderItemProps,
  ExtraRenderProps,
} from '../../../components/sortList'

export default function Order({
  columnOptions,
  orders,
  updateOrders,
}: Pick<HeaderBlockContext, 'orders' | 'updateOrders'> & {
  columnOptions: ColumnOption[]
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

  const subOptions = useCallback(
    (values: string[], keep?: string) => {
      return columnOptions.filter(
        (item) => item.value === keep || !values.includes(item.value),
      )
    },
    [columnOptions],
  )

  const RenderItem = useCallback(
    ({
      list,
      dragHandle,
      item,
      remove,
      update,
    }: RenderItemProps<DataCRUD.OrderBy<Record<string, any>>>) => {
      const leftOptions = subOptions(
        list.map((i) => i.key),
        item.key,
      )

      return (
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {dragHandle}
          <Select
            style={{ flex: 1 }}
            value={item.key}
            options={leftOptions}
            onChange={(v) => update('key', v)}
          />
          <Radio.Group
            optionType="button"
            options={[
              { label: '升序', value: 'asc' },
              { label: '降序', value: 'desc' },
            ]}
            value={item.desc ? 'desc' : 'asc'}
            onChange={(e) => update('desc', e.target.value === 'desc')}
          />
          <Tooltip title="删除">
            <Button danger icon={<DeleteOutlined />} onClick={remove} />
          </Tooltip>
        </div>
      )
    },
    [subOptions],
  )

  const FooterRender = useCallback(
    ({
      list,
      add,
    }: ExtraRenderProps<DataCRUD.OrderBy<Record<string, any>>, 'key'>) => {
      const leftOptions = subOptions(list.map((i) => i.key))

      return (
        <>
          {leftOptions.length > 0 && (
            <Select
              placeholder="添加排序字段"
              style={{ width: '100%' }}
              value={null}
              options={leftOptions}
              onChange={(v: string) => add({ key: v })}
            />
          )}
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
    [subOptions, handleClear, handleReset, handleConfirm],
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
        <SortList
          className="shuttle-data-order-list"
          pagination={false}
          list={orderList}
          rowKey="key"
          RenderItem={RenderItem}
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
