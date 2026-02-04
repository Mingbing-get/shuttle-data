import { useCallback, useRef } from 'react'
import { Button } from 'antd'
import { HolderOutlined } from '@ant-design/icons'

interface Props {
  style?: React.CSSProperties
  className?: string
  previewDom?: string | HTMLElement | (() => HTMLElement | null)
  onDragStart?: () => void
  onDragEnd?: () => void
}

export default function DragHandle({
  style,
  className,
  previewDom,
  onDragStart,
  onDragEnd,
}: Props) {
  const moveDomRef = useRef<HTMLElement>()

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const factDom = getDom(previewDom)
      if (factDom) {
        moveDomRef.current = factDom
        const rect = factDom.getBoundingClientRect()
        const offsetX = e.clientX - rect.left
        const offsetY = e.clientY - rect.top
        e.dataTransfer.setDragImage(factDom, offsetX, offsetY)

        setTimeout(() => {
          factDom.style.opacity = '0.3'
        }, 0)
      }

      onDragStart?.()
    },
    [previewDom, onDragStart],
  )

  const handleDragEnd = useCallback(() => {
    onDragEnd?.()
    if (!moveDomRef.current) return

    moveDomRef.current.style.opacity = '1'
    moveDomRef.current = undefined
  }, [onDragEnd])

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ ...style, cursor: 'move' }}
      className={className}
    >
      <Button
        type="text"
        size="small"
        icon={<HolderOutlined />}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      />
    </div>
  )
}

function getDom(dom?: string | HTMLElement | (() => HTMLElement | null)) {
  if (typeof dom === 'string') {
    return document.querySelector(dom) as HTMLElement
  } else if (dom instanceof HTMLElement) {
    return dom
  } else if (typeof dom === 'function') {
    return dom()
  }
}
