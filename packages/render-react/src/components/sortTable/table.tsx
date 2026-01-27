import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Table, TableProps } from 'antd'
import SortTableRow from './sortTableRow'
import { useMemo } from 'react'

interface SortTableProps<T extends Record<string, any>> extends TableProps<T> {
  onDragEnd?: (event: DragEndEvent) => void
}

function SortTable<T extends Record<string, any>>({
  dataSource,
  rowKey,
  onDragEnd,
  components,
  ...tableProps
}: SortTableProps<T>) {
  const _components = useMemo(
    () => ({
      ...components,
      body: {
        ...components?.body,
        row: SortTableRow,
      },
    }),
    [components],
  )

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext
        items={dataSource?.map((record) => (record as any)[rowKey]) || []}
        strategy={verticalListSortingStrategy}
      >
        <Table
          dataSource={dataSource}
          rowKey={rowKey}
          components={_components}
          {...tableProps}
        />
      </SortableContext>
    </DndContext>
  )
}

export default SortTable
