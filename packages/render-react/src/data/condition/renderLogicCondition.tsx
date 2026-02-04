import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Select } from 'antd'
import { DataCondition } from '@shuttle-data/type'

import { useCondition } from './context'
import RenderSingleCondition from './renderSingleCondition'
import RenderAddCondition from './renderAddCondition'
import DragHandle from './drag/handle'

interface Props {
  condition: DataCondition.AndCondition<any> | DataCondition.OrCondition<any>
}

const logicOption = [
  {
    label: '且',
    value: 'and',
  },
  {
    label: '或',
    value: 'or',
  },
]

export default function RenderLogicCondition({ condition }: Props) {
  const {
    condition: rootCondition,
    disabled,
    update,
    setDragCondition,
    clearDragCondition,
  } = useCondition()
  const rightBox = useRef<HTMLDivElement>(null)
  const leftBox = useRef<HTMLDivElement>(null)
  const wrapper = useRef<HTMLDivElement>(null)

  const computedOffset = useCallback(() => {
    if (!rightBox.current) return

    const singleField = rightBox.current.children
    if (!singleField?.length) return

    const topHeight = singleField[0].clientHeight
    const bottomHeight = singleField[singleField.length - 1].clientHeight

    leftBox.current?.setAttribute(
      'style',
      `--logic-line-top-offset: ${topHeight / 2}px; --logic-line-bottom-offset: ${-bottomHeight / 2}px;`,
    )
  }, [])

  useEffect(() => {
    requestAnimationFrame(() => {
      computedOffset()
    })
  }, [condition.subCondition])

  const getWrapper = useCallback(() => wrapper.current, [])

  const updateStartCondition = useCallback(() => {
    setDragCondition(condition)
  }, [condition, setDragCondition])

  const showDrag = useMemo(
    () => !disabled && condition !== rootCondition,
    [disabled, condition, rootCondition],
  )

  return (
    <div
      className="shuttle-data-condition-logic-wrapper"
      ref={wrapper}
      style={{ '--offset-x': showDrag ? '26px' : '0px' } as any}
    >
      <div className="shuttle-data-condition-logic-left" ref={leftBox}>
        <div className="shuttle-data-condition-logic-top"></div>
        <div className="shuttle-data-condition-logic-select">
          {showDrag && (
            <DragHandle
              previewDom={getWrapper}
              onDragStart={updateStartCondition}
              onDragEnd={clearDragCondition}
            />
          )}
          <Select
            disabled={disabled}
            options={logicOption}
            value={condition.op}
            onChange={(v) => update(condition, { ...condition, op: v })}
          />
        </div>
        <div className="shuttle-data-condition-logic-bottom"></div>
      </div>
      <div ref={rightBox} className="shuttle-data-condition-logic-right">
        {condition.subCondition.map((subCondition, index) => (
          <RenderSingleCondition key={index} condition={subCondition} />
        ))}
        {!disabled && <RenderAddCondition parent={condition} />}
      </div>
    </div>
  )
}
