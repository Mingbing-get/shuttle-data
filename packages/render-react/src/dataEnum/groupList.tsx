import { useMemo } from 'react'
import { Table, TableProps, TableColumnsType, Tag } from 'antd'
import { DataEnumManager } from '@shuttle-data/client'
import { DataEnum } from '@shuttle-data/type'

import { useGroupList } from './hooks'
import tableStringFilter from '../components/tableStringFilter'

export interface DataEnumGroupListProps extends Omit<
  TableProps<Omit<DataEnum.Group, 'items'>>,
  'dataSource' | 'loading' | 'rowKey'
> {
  manager: DataEnumManager
  showEnumGroupList?: Omit<DataEnum.Group, 'items'>[]
}

export default function DataEnumGroupList({
  manager,
  columns,
  showEnumGroupList,
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
          ...tableStringFilter<Omit<DataEnum.Group, 'items'>>('name'),
        },
        {
          title: 'API名称',
          dataIndex: 'apiName',
          fixed: 'left',
          minWidth: 220,
          ...tableStringFilter<Omit<DataEnum.Group, 'items'>>('apiName'),
        },
        {
          title: '名称',
          dataIndex: 'label',
          minWidth: 220,
          ...tableStringFilter<Omit<DataEnum.Group, 'items'>>('label'),
        },
        {
          title: '系统枚举',
          dataIndex: 'isSystem',
          minWidth: 120,
          filters: [
            { text: '是', value: true },
            { text: '否', value: false },
          ],
          onFilter: (value, record) => !!record.isSystem === value,
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

  const showGroupList = useMemo(() => {
    return showEnumGroupList || groupList
  }, [showEnumGroupList, groupList])

  return (
    <Table
      {...rest}
      rowKey="name"
      dataSource={showGroupList}
      columns={tableColumns}
      loading={loading}
    />
  )
}
