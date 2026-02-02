import { useMemo } from 'react'
import {
  Popover,
  Button,
  Table,
  TableColumnsType,
  Switch,
  Radio,
  InputNumber,
} from 'antd'
import { SettingOutlined } from '@ant-design/icons'

import { HeaderBlockContext } from '..'

export default function ColumnsConfig({
  columns,
  updateColumnConfig,
}: Pick<HeaderBlockContext, 'columns' | 'updateColumnConfig'>) {
  const tableColumns = useMemo(() => {
    const columns: TableColumnsType = [
      {
        title: '表头',
        dataIndex: 'title',
        width: 180,
      },
      {
        title: '隐藏',
        dataIndex: 'hidden',
        width: 120,
        render: (hidden: boolean, row) => (
          <Switch
            checked={hidden}
            onChange={(checked) => {
              updateColumnConfig(row.key, 'hidden', checked)
            }}
          />
        ),
      },
      {
        title: '宽度(px)',
        dataIndex: 'width',
        width: 160,
        render: (width: number, row) => (
          <InputNumber
            min={0}
            precision={0}
            value={width || row.minWidth || 240}
            onChange={(value) => {
              updateColumnConfig(row.key, 'width', value || 240)
            }}
            onFocus={(e) => {
              e.stopPropagation()
              e.nativeEvent.stopImmediatePropagation()
            }}
          />
        ),
      },
      {
        title: '固定',
        dataIndex: 'fixed',
        width: 180,
        render: (fixed: 'left' | 'right' | false, row) => (
          <Radio.Group
            optionType="button"
            value={fixed || false}
            onChange={(e) => {
              updateColumnConfig(row.key, 'fixed', e.target.value)
            }}
          >
            <Radio value={false}>无</Radio>
            <Radio value="left">左</Radio>
            <Radio value="right">右</Radio>
          </Radio.Group>
        ),
      },
    ]

    return columns
  }, [])

  return (
    <Popover
      trigger="click"
      getPopupContainer={() => document.body}
      placement="bottomLeft"
      showArrow={false}
      content={
        <Table
          pagination={false}
          columns={tableColumns}
          dataSource={columns}
          scroll={{ y: 340, x: 420 }}
        />
      }
    >
      <Button icon={<SettingOutlined />} />
    </Popover>
  )
}
