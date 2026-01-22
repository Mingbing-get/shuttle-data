import { useMemo } from 'react'
import { Table, TableProps, TableColumnsType, Tag } from 'antd'
import { DataEnumManager } from '@shuttle-data/client'
import { DataEnum } from '@shuttle-data/type'

import { useGroupList } from './hooks'

export interface DataEnumGroupListProps extends Omit<
  TableProps<Omit<DataEnum.Group, 'items'>>,
  'dataSource' | 'loading' | 'rowKey'
> {
  manager: DataEnumManager
}

export default function DataEnumGroupList({
  manager,
  columns,
  ...rest
}: DataEnumGroupListProps) {
  const { loading, groupList } = useGroupList(manager)

  const tableColumns: TableColumnsType<Omit<DataEnum.Group, 'items'>> =
    useMemo(() => {
      return [
        {
          title: '唯一标识',
          dataIndex: 'name',
          fixed: 'left',
          minWidth: 220,
        },
        {
          title: 'API名称',
          dataIndex: 'apiName',
          fixed: 'left',
          minWidth: 220,
        },
        {
          title: '名称',
          dataIndex: 'label',
          minWidth: 220,
        },
        {
          title: '系统枚举',
          dataIndex: 'isSystem',
          minWidth: 120,
          render: (isSystem) =>
            isSystem ? (
              <Tag color="green">是</Tag>
            ) : (
              <Tag color="yellow">否</Tag>
            ),
        },
        ...(columns || []),
      ]
    }, [columns])

  return (
    <Table
      {...rest}
      rowKey="name"
      dataSource={groupList}
      columns={tableColumns}
      loading={loading}
    />
  )
}
