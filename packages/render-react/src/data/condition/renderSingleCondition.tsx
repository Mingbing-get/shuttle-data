import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { DataCondition, conditionPluginManager } from '@shuttle-data/type'

import RenderLogicRule from './renderLogicCondition'
import RenderNormalCondition from './renderNormalCondition'
import { useCondition } from './context'
import DragTarget from './drag/target'

interface Props {
  condition: DataCondition.Define<any>
}

export default function RenderSingleCondition({ condition }: Props) {
  const { move, dragCondition, canDropConditions, clearDragCondition } =
    useCondition()

  const isComplete = useMemo(() => {
    if (isLogicCondition(condition)) return true

    return conditionPluginManager.check(condition)
  }, [condition])

  const canDrop = useMemo(
    () => canDropConditions.includes(condition),
    [condition, canDropConditions],
  )

  const moveBefore = useCallback(() => {
    if (!dragCondition) return

    clearDragCondition()
    move(dragCondition, condition, true)
  }, [condition, dragCondition, move, clearDragCondition])

  const moveAfter = useCallback(() => {
    if (!dragCondition) return

    clearDragCondition()
    move(dragCondition, condition, false)
  }, [condition, dragCondition, move, clearDragCondition])

  return (
    <div
      className={classNames(
        'shuttle-data-condition-single',
        !isComplete && 'not-complete',
      )}
    >
      {canDrop && <DragTarget before onDrop={moveBefore} />}
      {isLogicCondition(condition) ? (
        <RenderLogicRule condition={condition} />
      ) : (
        <RenderNormalCondition condition={condition} />
      )}
      {canDrop && <DragTarget onDrop={moveAfter} />}
    </div>
  )
}

function isLogicCondition(condition: DataCondition.Define<any>) {
  return condition.op === 'and' || condition.op === 'or'
}
