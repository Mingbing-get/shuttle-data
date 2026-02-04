import classNames from 'classnames'
import { useCallback, useState } from 'react'

import './target.scss'

interface Props {
  before?: boolean
  onDrop?: () => void
}

export default function DragTarget({ before, onDrop }: Props) {
  const [isOver, setIsOver] = useState(false)

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setIsOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setIsOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsOver(false)
      onDrop?.()
    },
    [onDrop],
  )

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={classNames(
        'drag-target',
        before ? 'is-before' : 'is-after',
        isOver && 'is-over',
      )}
    />
  )
}
