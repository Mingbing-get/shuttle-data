import { useMemo } from 'react'
import { Table, TableProps, TableColumnsType, Tag } from 'antd'
import { DataModelSchema } from '@shuttle-data/client'
import { DataModel } from '@shuttle-data/type'

import { useTableList } from './hooks'
import tableStringFilter from '../components/tableStringFilter'

export interface DataModelTableListProps extends Omit<
  TableProps<Omit<DataModel.Define, 'fields'>>,
  'dataSource' | 'loading' | 'rowKey'
> {
  schema: DataModelSchema
  dataSourceName?: string
}

export default function DataModelTableList({
  schema,
  columns,
  dataSourceName,
  ...rest
}: DataModelTableListProps) {
  const { loading, tableList } = useTableList(schema)

  const tableColumns: TableColumnsType<Omit<DataModel.Define, 'fields'>> =
    useMemo(() => {
      return [
        {
          title: '唯一标识',
          dataIndex: 'name',
          fixed: 'left',
          minWidth: 220,
          ...tableStringFilter<Omit<DataModel.Define, 'fields'>>('name'),
        },
        {
          title: 'API名称',
          dataIndex: 'apiName',
          fixed: 'left',
          minWidth: 220,
          ...tableStringFilter<Omit<DataModel.Define, 'fields'>>('apiName'),
        },
        {
          title: '名称',
          dataIndex: 'label',
          minWidth: 220,
          ...tableStringFilter<Omit<DataModel.Define, 'fields'>>('label'),
        },
        {
          title: '系统模型',
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

  const afterFilterTableList = useMemo(() => {
    if (!dataSourceName) {
      return tableList
    }

    return tableList.filter((item) => item.name === dataSourceName)
  }, [dataSourceName, tableList])

  return (
    <Table
      {...rest}
      rowKey="name"
      dataSource={afterFilterTableList}
      columns={tableColumns}
      loading={loading}
    />
  )
}
