import { useState, useCallback, useEffect } from 'react'
import { DataCRUD, DataModel as NDataModel } from '@shuttle-data/type'
import { Button, Radio, Tooltip, Select } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

import SortList, {
  RenderItemProps,
  ExtraRenderProps,
  SortListProps,
} from '../../components/sortList'

export interface OrderRenderFooterProps extends ExtraRenderProps<
  DataCRUD.OrderBy<Record<string, any>>,
  'key'
> {
  defaultAdd: React.ReactNode
}

export interface OrderRenderProps extends Omit<
  SortListProps<DataCRUD.OrderBy<any>, 'key'>,
  | 'list'
  | 'rowKey'
  | 'RenderItem'
  | 'onChange'
  | 'HeaderRender'
  | 'FooterRender'
  | 'pagination'
> {
  value?: DataCRUD.OrderBy<any>[]
  fields: NDataModel.Field[]
  useApiName?: boolean
  onChange?: (value: DataCRUD.OrderBy<any>[]) => void
  FooterRender?: (props: OrderRenderFooterProps) => React.ReactNode
}

export default function OrderRender({
  value,
  fields,
  useApiName,
  onChange,
  FooterRender,
  ...extraProps
}: OrderRenderProps) {
  const [orderList, setOrderList] = useState(value || [])

  useEffect(() => {
    setOrderList(value || [])
  }, [value])

  const subFields = useCallback(
    (values: string[], keep?: string) => {
      return fields.reduce(
        (total: { value: string; label?: string }[], item) => {
          const key = useApiName ? item.apiName : item.name
          const needAdd = keep === key || !values.includes(key)
          if (needAdd) {
            total.push({
              value: key,
              label: item.label,
            })
          }

          return total
        },
        [],
      )
    },
    [fields, useApiName],
  )

  const RenderItem = useCallback(
    ({
      list,
      dragHandle,
      item,
      remove,
      update,
    }: RenderItemProps<DataCRUD.OrderBy<Record<string, any>>>) => {
      const leftOptions = subFields(
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
    [subFields],
  )

  const _FooterRender = useCallback(
    (props: ExtraRenderProps<DataCRUD.OrderBy<Record<string, any>>, 'key'>) => {
      if (!FooterRender) return null

      const leftOptions = subFields(props.list.map((i) => i.key))
      const defaultAdd = (
        <>
          {leftOptions.length > 0 && (
            <Select
              placeholder="添加排序字段"
              style={{ width: '100%' }}
              value={null}
              options={leftOptions}
              onChange={(v: string) => props.add({ key: v })}
            />
          )}
        </>
      )

      return <FooterRender {...props} defaultAdd={defaultAdd} />
    },
    [subFields, FooterRender],
  )

  const handleChange = useCallback(
    (list: DataCRUD.OrderBy<any>[]) => {
      setOrderList(list)
      onChange?.(list)
    },
    [onChange],
  )

  return (
    <SortList
      {...extraProps}
      pagination={false}
      list={orderList}
      rowKey="key"
      RenderItem={RenderItem}
      FooterRender={_FooterRender}
      onChange={handleChange}
    />
  )
}
