import { useCallback } from 'react'
import { DataForm, useTable, DataCondition } from '@shuttle-data/render-react'
import { DataCRUD } from '@shuttle-data/type'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
  CatchResultError,
} from '@shuttle-ai/render-react'
import { Flex, Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

interface ConditionUpdateRecordParams extends DataCRUD.UpdateOption<any> {
  modelName: string
  useApiName: boolean
}

export interface ConditionUpdateRecordToolRenderProps {}

export default function ConditionUpdateRecordToolRender(
  props: ConditionUpdateRecordToolRenderProps,
) {
  const { dataModel } = useWorkContext()
  const { args, effectArgs, updateArg, confirmResult, result, agent, toolId } =
    useTool<ConditionUpdateRecordParams, string>()

  const { loading, table } = useTable(
    dataModel.schema,
    effectArgs.modelName,
    effectArgs.useApiName,
  )

  const getNewArgs = useCallback(async () => {
    if (args === effectArgs) return

    return effectArgs
  }, [args, effectArgs])

  return (
    <Spin indicator={<LoadingOutlined spin />} spinning={loading}>
      <Flex
        vertical
        gap={8}
        style={{ backgroundColor: '#fff', borderRadius: 8, padding: 8 }}
      >
        <Row align="middle" gutter={8}>
          <Col style={{ fontWeight: 'bold' }}>数据模型：</Col>
          <Col flex={1}>{table?.label || effectArgs.modelName}</Col>
        </Row>
        <Row align="middle" gutter={8}>
          <Col style={{ fontWeight: 'bold' }}>更新条件：</Col>
          <Col flex={1}>
            <DataCondition
              {...props}
              disabled={!!confirmResult}
              condition={effectArgs.condition}
              dataModel={dataModel}
              useApiName={effectArgs.useApiName}
              fields={table?.fields || []}
              onChange={(condition) => updateArg(['condition'], condition)}
            />
          </Col>
        </Row>
        <Row align="middle" gutter={8}>
          <Col style={{ fontWeight: 'bold' }}>更新数据：</Col>
          <Col flex={1}>
            <DataForm
              disabled={!!confirmResult}
              dataModel={dataModel}
              tableName={effectArgs.modelName}
              useApiName={effectArgs.useApiName}
              value={effectArgs.data}
              hiddenEmptyValueField
              footer={() => null}
              onValuesChange={(_, values) => updateArg(['data'], values)}
            />
          </Col>
        </Row>
        <CatchResultError
          title="执行结果"
          result={result}
          successRender={(content) => <span>{content}</span>}
        />
        <ToolConfirmRender
          agent={agent}
          toolId={toolId}
          result={confirmResult}
          getNewArgs={getNewArgs}
        />
      </Flex>
    </Spin>
  )
}
