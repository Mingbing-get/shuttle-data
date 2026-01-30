import { TableColumnGroupType, TableColumnType } from 'antd'

export function isGroupColumn(
  column: TableColumnGroupType | TableColumnType,
): column is TableColumnGroupType {
  return 'children' in column
}

export function generateKey() {
  return Math.random().toString(36).substring(2)
}
