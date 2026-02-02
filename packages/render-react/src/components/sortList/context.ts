import { createContext } from 'react'
import { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

export interface SortableListItemContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void
  listeners?: SyntheticListenerMap
  attributes?: DraggableAttributes
}

export const SortableListItemContext =
  createContext<SortableListItemContextProps>({})
