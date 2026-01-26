import { TableColumnType, Input, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

export default function createTableStringFilter<T extends Record<string, any>>(
  dataIndex: string,
) {
  const columnFilter: TableColumnType<T> = {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
          }}
        >
          <Input
            value={selectedKeys[0]}
            allowClear
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
          />
          <Button type="primary" onClick={() => confirm()}>
            确认
          </Button>
        </div>
      )
    },
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
  }

  return columnFilter
}
