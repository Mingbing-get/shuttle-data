import { useCallback, useMemo, useRef } from 'react'
import { Select, Row, Col, Button, Flex } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { DataCondition, conditionPluginManager } from '@shuttle-data/type'

import fieldPlugin from '../../fieldPlugin'
import { useCondition } from './context'
import DragHandle from './drag/handle'

interface Props {
  condition: Exclude<DataCondition.Define<any>, { op: 'and' | 'or' }>
}

export default function RenderNormalCondition({ condition }: Props) {
  const wrapper = useRef<HTMLDivElement>(null)

  const {
    update,
    remove,
    setDragCondition,
    clearDragCondition,
    fields,
    dataModel,
    useApiName,
    disabled,
  } = useCondition()

  const fieldOptions = useMemo(
    () =>
      fields.map((item) => ({
        label: item.label,
        value: useApiName ? item.apiName : item.name,
      })),
    [fields, useApiName],
  )

  const fieldInfo = useMemo(() => {
    const field = fields.find((item) =>
      useApiName ? item.apiName === condition.key : item.name === condition.key,
    )
    const plugin = field ? fieldPlugin.getPlugin(field.type) : undefined

    if (field && plugin) {
      return {
        field,
        plugin,
        ValueRender: plugin.getConditionInputRender(),
      }
    }
  }, [fields, useApiName, condition.key])

  const opOptions = useMemo(() => {
    if (!fieldInfo) return []

    const effectOps = fieldInfo.plugin.getSupportConditionOps(fieldInfo.field)

    return effectOps.map((op) => ({
      label: conditionPluginManager.getPlugin(op).label,
      value: op,
    }))
  }, [fieldInfo])

  const getWrapper = useCallback(() => wrapper.current, [])

  const updateStartCondition = useCallback(() => {
    setDragCondition(condition)
  }, [condition, setDragCondition])

  return (
    <Flex align="center" ref={wrapper}>
      <DragHandle
        previewDom={getWrapper}
        onDragStart={updateStartCondition}
        onDragEnd={clearDragCondition}
      />
      <Row
        gutter={8}
        align="middle"
        className="shuttle-data-condition-normal-item"
      >
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            options={fieldOptions}
            value={condition.key}
            onChange={(value) => update(condition, { key: value } as any)}
          />
        </Col>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            options={opOptions}
            value={condition.op}
            onChange={(value) =>
              update(condition, { key: condition.key, op: value } as any)
            }
          />
        </Col>
        {fieldInfo && (
          <Col span={8}>
            <fieldInfo.ValueRender
              style={{ width: '100%' }}
              field={fieldInfo.field}
              dataModel={dataModel}
              op={condition.op}
              useApiName={useApiName}
              disabled={disabled}
              value={(condition as any).value}
              onChange={(value) =>
                update(condition, { ...condition, value } as any)
              }
              onFocus={(e) => {
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
              }}
            />
          </Col>
        )}
        <div className="shuttle-data-condition-normal-item-actions">
          <Button
            danger
            type="primary"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => remove(condition)}
          />
        </div>
      </Row>
    </Flex>
  )
}
