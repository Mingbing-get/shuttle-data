import React, { useContext } from 'react'
import { HolderOutlined } from '@ant-design/icons'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { Button } from 'antd'

export interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void
  listeners?: SyntheticListenerMap
}

export const RowContext = React.createContext<RowContextProps>({})

const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext)
  return (
    <Button
      type="text"
      icon={<HolderOutlined />}
      style={{ cursor: 'move' }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  )
}

export default DragHandle
