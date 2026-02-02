import { useCallback, useEffect, useMemo, useState } from 'react'
import { List, ListProps } from 'antd'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

import SortableListItem from './item'
import DragHandle from './handle'

export interface RenderItemProps<T extends Record<string, any>> {
  list: T[]
  item: T
  index: number
  dragHandle: React.ReactNode
  remove: () => void
  update: <CK extends keyof T>(k: CK, v: T[CK]) => void
}

export interface ExtraRenderProps<
  T extends Record<string, any>,
  K extends keyof T,
> {
  list: T[]
  remove: (rowKey: T[K]) => void
  update: <CK extends keyof T>(rowKey: T[K], k: CK, v: T[CK]) => void
  add: (item: T, targetRowKey?: T[K], location?: 'before' | 'after') => void
}

export interface SortListProps<
  T extends Record<string, any>,
  K extends keyof T,
> extends Omit<
  ListProps<T>,
  'renderItem' | 'dataSource' | 'rowKey' | 'header' | 'footer'
> {
  list?: T[]
  rowKey: K
  RenderItem: (p: RenderItemProps<T>) => React.ReactNode
  onChange?: (list: T[]) => void
  HeaderRender?: (props: ExtraRenderProps<T, K>) => React.ReactNode
  FooterRender?: (props: ExtraRenderProps<T, K>) => React.ReactNode
}

export default function SortList<
  T extends Record<string, any>,
  K extends keyof T,
>({
  rowKey,
  list,
  RenderItem,
  onChange,
  HeaderRender,
  FooterRender,
  ...listProps
}: SortListProps<T, K>) {
  const [data, setData] = useState(list || [])

  useEffect(() => {
    setData((old) => {
      if (old !== list) {
        return list || []
      }
      return old
    })
  }, [list])

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!active || !over) return

      if (active.id !== over.id) {
        setData((prevState) => {
          const activeIndex = prevState.findIndex(
            (i) => i[rowKey] === active.id,
          )
          const overIndex = prevState.findIndex((i) => i[rowKey] === over.id)
          const newData = arrayMove(prevState, activeIndex, overIndex)
          onChange?.(newData)
          return newData
        })
      }
    },
    [rowKey, onChange],
  )

  const handleRemove = useCallback(
    (rowUnque: T[K]) => {
      setData((prevState) => {
        const newData = prevState.filter((i) => i[rowKey] !== rowUnque)
        onChange?.(newData)
        return newData
      })
    },
    [rowKey, onChange],
  )

  const handleAdd = useCallback(
    (item: T, targetRowKey?: T[K], location?: 'before' | 'after') => {
      setData((prevState) => {
        const newState = [...prevState]

        if (targetRowKey) {
          const targetIndex = prevState.findIndex(
            (i) => i[rowKey] === targetRowKey,
          )
          if (targetIndex === -1) {
            return prevState
          }

          newState.splice(
            location === 'before' ? targetIndex : targetIndex + 1,
            0,
            item,
          )
        } else {
          newState.push(item)
        }

        onChange?.(newState)
        return newState
      })
    },
    [rowKey, onChange],
  )

  const handleUpdate = useCallback(
    <CK extends keyof T>(rowUnque: T[K], k: CK, v: T[CK]) => {
      setData((prevState) => {
        const index = prevState.findIndex((i) => i[rowKey] === rowUnque)
        if (index === -1) {
          return prevState
        }
        const newState = [...prevState]
        const newItem = {
          ...newState[index],
          [k]: v,
        }
        newState[index] = newItem
        onChange?.(newState)
        return newState
      })
    },
    [rowKey, onChange],
  )

  const { header, footer } = useMemo(() => {
    const context = {
      list: data,
      remove: handleRemove,
      update: handleUpdate,
      add: handleAdd,
    }

    return {
      header: HeaderRender?.(context),
      footer: FooterRender?.(context),
    }
  }, [HeaderRender, FooterRender, handleRemove, handleAdd, handleUpdate, data])

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
      <SortableContext
        items={data.map((item) => item[rowKey]) || []}
        strategy={verticalListSortingStrategy}
      >
        <List
          {...listProps}
          header={header}
          footer={footer}
          rowKey={rowKey}
          dataSource={data}
          renderItem={(item, index) => (
            <SortableListItem key={item[rowKey]} itemKey={item[rowKey]}>
              <RenderItem
                list={data}
                item={item}
                index={index}
                dragHandle={<DragHandle />}
                remove={() => handleRemove(item[rowKey])}
                update={(k, v) => handleUpdate(item[rowKey], k, v)}
              />
            </SortableListItem>
          )}
        />
      </SortableContext>
    </DndContext>
  )
}
