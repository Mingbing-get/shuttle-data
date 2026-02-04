import { useCallback, useEffect, useMemo, useState } from 'react'
import { Popover, Button, Divider, Flex } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import { DataModel as NDataModel } from '@shuttle-data/type'

import { HeaderBlockContext } from '..'
import { ColumnOption } from '.'
import ConditionRender from '../../condition'

export default function Condition({
  useApiName,
  dataModel,
  columnOptions,
  condition,
  updateCondition,
}: Pick<
  HeaderBlockContext,
  'dataModel' | 'condition' | 'updateCondition' | 'useApiName'
> & {
  columnOptions: ColumnOption[]
}) {
  const [showPopover, setShowPopover] = useState(false)
  const [_condition, setCondition] = useState(condition)

  useEffect(() => {
    if (!showPopover) {
      requestAnimationFrame(() => {
        setCondition(condition)
      })
    }
  }, [showPopover, condition])

  const handleClear = useCallback(() => {
    updateCondition()
    setCondition(undefined)
    setShowPopover(false)
  }, [updateCondition])

  const handleReset = useCallback(() => {
    setCondition(condition)
  }, [condition])

  const handleConfirm = useCallback(() => {
    updateCondition(_condition)
    setShowPopover(false)
  }, [_condition, updateCondition])

  const conditionFields = useMemo(() => {
    return columnOptions.map(
      ({ label, field }) =>
        ({
          ...field,
          label,
        }) as NDataModel.Field,
    )
  }, [columnOptions])

  return (
    <Popover
      open={showPopover}
      onOpenChange={setShowPopover}
      trigger="click"
      getPopupContainer={() => document.body}
      placement="bottomLeft"
      showArrow={false}
      content={
        <>
          <ConditionRender
            style={{ maxHeight: 280, minWidth: 320, overflowY: 'auto' }}
            dataModel={dataModel}
            fields={conditionFields}
            condition={_condition}
            onChange={setCondition}
            useApiName={useApiName}
          />
          <Divider style={{ margin: '0.5rem 0' }} />
          <Flex justify="center" gap={8}>
            <Button onClick={handleClear}>清空</Button>
            <Button onClick={handleReset}>重置</Button>
            <Button type="primary" onClick={handleConfirm}>
              确认
            </Button>
          </Flex>
        </>
      }
    >
      <Button
        color={condition ? 'primary' : 'default'}
        variant="outlined"
        icon={<FilterOutlined />}
      />
    </Popover>
  )
}
