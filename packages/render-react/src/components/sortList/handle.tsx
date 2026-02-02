import { useContext } from 'react'
import { Button } from 'antd'
import { HolderOutlined } from '@ant-design/icons'

import { SortableListItemContext } from './context'

export default function DragHandle() {
  const { setActivatorNodeRef, listeners, attributes } = useContext(
    SortableListItemContext,
  )

  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: 'move' }}
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
    />
  )
}
