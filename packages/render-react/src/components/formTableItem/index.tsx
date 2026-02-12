import { useCallback, useState, useMemo, useEffect } from 'react'
import {
  Form,
  Button,
  TableColumnsType,
  TableColumnType,
  Divider,
  Tooltip,
  TableProps,
} from 'antd'
import {
  DeleteFilled,
  PlusOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import classNames from 'classnames'

import { SortTable, DragHandle } from '../../components/sortTable'

import './index.scss'

export interface FormTableItemProps<T extends Record<string, any>> extends Omit<
  TableProps<T>,
  | 'dataSource'
  | 'rowKey'
  | 'onScroll'
  | 'onRow'
  | 'onHeaderRow'
  | 'rowClassName'
> {
  fieldName: string
  rowKey: keyof T
  showFocusRow?: boolean
  disabled?: boolean
  onAdd?: () => T
  disabledDelete?: (row: T) => boolean
  onFocusRowChange?: (fieldName: string) => void
}

export default function FormTableItem<T extends Record<string, any>>({
  fieldName,
  rowKey,
  columns,
  style,
  className,
  showFocusRow = true,
  disabled,
  onAdd,
  disabledDelete,
  onFocusRowChange,
  ...tableProps
}: FormTableItemProps<T>) {
  const [focusRowName, setFocusRowName] = useState<string>('')
  const [scrollLeft, setScrollLeft] = useState(0)

  const form = Form.useFormInstance()
  const list: T[] = Form.useWatch(fieldName, form)

  const afterFilterList = useMemo(
    () => list?.filter((item) => item[rowKey]) || [],
    [list, rowKey],
  )

  useEffect(() => {
    onFocusRowChange?.(focusRowName)
  }, [focusRowName, onFocusRowChange])

  const handleRemove = useCallback((rowName: string) => {
    const list: T[] = form.getFieldValue(fieldName) || []
    const index = list.findIndex((item) => item[rowKey] === rowName)
    if (index !== -1) {
      const newList = [...list]
      newList.splice(index, 1)
      form.setFieldValue(fieldName, newList)
      setFocusRowName((old) => (old === rowName ? '' : old))
    }
  }, [])

  const handleAdd = useCallback(
    (targetRowName: string, position: 'before' | 'after') => {
      const list: T[] = form.getFieldValue(fieldName) || []
      const newList = [...list]

      const newItem = onAdd?.() || ({} as T)
      const index = newList.findIndex((item) => item[rowKey] === targetRowName)
      newList.splice(
        position === 'before' ? Math.max(index, 0) : index + 1,
        0,
        newItem,
      )

      form.setFieldValue(fieldName, newList)
      setFocusRowName(newItem[rowKey])
    },
    [],
  )

  const handleMove = useCallback((rowName: string, position: 'up' | 'down') => {
    const list: T[] = form.getFieldValue(fieldName) || []
    const newList = [...list]

    const index = newList.findIndex((item) => item[rowKey] === rowName)
    if (index === -1) {
      return
    }

    const targetIndex = position === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newList.length) {
      return
    }

    const targetItem = newList[targetIndex]
    newList[targetIndex] = newList[index]
    newList[index] = targetItem

    form.setFieldValue(fieldName, newList)
  }, [])

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const list: T[] = form.getFieldValue(fieldName) || []
    const newList = [...list]

    const activeIndex = newList.findIndex(
      (item) => item[rowKey] === e.active.id,
    )
    if (activeIndex === -1) {
      return
    }

    const targetIndex = newList.findIndex((item) => item[rowKey] === e.over?.id)
    if (targetIndex === -1) {
      return
    }

    form.setFieldValue(fieldName, arrayMove(newList, activeIndex, targetIndex))
  }, [])

  const tableColumns: TableColumnsType<T> = useMemo(() => {
    const actoinCell: TableColumnType<T> = {
      render: (_, row, index) => (
        <div className="table-action-cell" onClick={(e) => e.stopPropagation()}>
          <DragHandle />
          <Divider vertical style={{ height: '100%' }} />
          <Tooltip title="删除">
            <Button
              disabled={disabledDelete?.(row)}
              danger
              onClick={() => handleRemove(row[rowKey])}
              icon={<DeleteFilled />}
            />
          </Tooltip>
          <Divider vertical style={{ height: '100%' }} />
          <div className="table-action-col">
            <Tooltip title="在前面插入行">
              <Button
                type="primary"
                size="small"
                onClick={() => handleAdd(row[rowKey], 'before')}
                icon={<PlusOutlined />}
              />
            </Tooltip>
            <Divider style={{ margin: '2px 0' }} />
            <Tooltip title="在后面插入行">
              <Button
                type="primary"
                size="small"
                onClick={() => handleAdd(row[rowKey], 'after')}
                icon={<PlusOutlined />}
              />
            </Tooltip>
          </div>
          <Divider vertical style={{ height: '100%' }} />
          <div className="table-action-col">
            <Tooltip title="上移">
              <Button
                disabled={index === 0}
                type="primary"
                size="small"
                onClick={() => handleMove(row[rowKey], 'up')}
                icon={<ArrowUpOutlined />}
              />
            </Tooltip>
            <Divider style={{ margin: '2px 0' }} />
            <Tooltip title="下移">
              <Button
                type="primary"
                size="small"
                onClick={() => handleMove(row[rowKey], 'down')}
                icon={<ArrowDownOutlined />}
              />
            </Tooltip>
          </div>
        </div>
      ),
      width: 0,
    }

    const tableColumns = [...(columns || [])]

    if (!disabled) {
      tableColumns.unshift(actoinCell)
    }

    return tableColumns
  }, [columns, disabled])

  return (
    <SortTable
      className={classNames('form-table-item', className)}
      style={{ '--table-scroll-left': `${scrollLeft}px`, ...style } as any}
      onDragEnd={handleDragEnd}
      onScroll={(e) => {
        setScrollLeft((e.target as HTMLElement).scrollLeft)
      }}
      onRow={(record) => {
        return {
          onClick: () => {
            setFocusRowName(record[rowKey])
          },
        }
      }}
      onHeaderRow={() => {
        return {
          onClick: () => {
            setFocusRowName('')
          },
        }
      }}
      rowClassName={(record) => {
        return showFocusRow && record[rowKey] === focusRowName
          ? 'table-row-focused'
          : ''
      }}
      dataSource={afterFilterList}
      columns={tableColumns}
      rowKey={rowKey}
      {...tableProps}
    />
  )
}
