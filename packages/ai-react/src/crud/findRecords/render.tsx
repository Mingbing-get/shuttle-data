import { useCallback, useMemo } from 'react'
import {
  DataCondition,
  DataOrder,
  DataTable,
  OrderRenderFooterProps,
  ModelFieldSelect,
  useTable,
} from '@shuttle-data/render-react'
import { DataCRUD } from '@shuttle-data/type'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
  CatchResultError,
} from '@shuttle-ai/render-react'
import { Flex, Spin, Row, Col, InputNumber } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

interface FindRecordsParams extends DataCRUD.FindOption<any> {
  modelName: string
  useApiName: boolean
}

export interface FindRecordsToolRenderProps {}

export default function CountToolRender(props: FindRecordsToolRenderProps) {
  const { dataModel } = useWorkContext()
  const { args, effectArgs, updateArg, confirmResult, result, agent, toolId } =
    useTool<FindRecordsParams, Record<string, any>[]>()

  const { loading, table } = useTable(
    dataModel.schema,
    effectArgs.modelName,
    effectArgs.useApiName,
  )

  const resultTableColumns = useMemo(() => {
    return effectArgs.fields?.map((field) => ({
      key: field as string,
      dataIndex: field as string,
    }))
  }, [effectArgs])

  const getNewArgs = useCallback(async () => {
    if (effectArgs === args) return

    return effectArgs
  }, [args, effectArgs])

  const footerRender = useCallback(
    (props: OrderRenderFooterProps) => props.defaultAdd,
    [],
  )

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
          <Col style={{ fontWeight: 'bold' }}>查询字段：</Col>
          <Col flex={1}>
            <ModelFieldSelect
              disabled={!!confirmResult}
              schema={dataModel.schema}
              mode="multiple"
              value={effectArgs.fields}
              tableName={effectArgs.modelName}
              useApiName={effectArgs.useApiName}
              onChange={(v) => updateArg(['fields'], v)}
            />
          </Col>
        </Row>
        <Row align="middle" gutter={8}>
          <Col style={{ fontWeight: 'bold' }}>查询条件：</Col>
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
          <Col style={{ fontWeight: 'bold' }}>查询排序：</Col>
          <Col flex={1}>
            <DataOrder
              locale={{
                emptyText: <></>,
              }}
              disabled={!!confirmResult}
              value={effectArgs.orders}
              fields={table?.fields || []}
              useApiName={effectArgs.useApiName}
              onChange={(v) => updateArg(['orders'], v)}
              FooterRender={footerRender}
            />
          </Col>
        </Row>
        <Row align="middle" gutter={8}>
          <Col style={{ fontWeight: 'bold' }}>查询条数：</Col>
          <Col flex={1}>
            <InputNumber
              value={effectArgs.limit}
              onChange={(v) => updateArg(['limit'], v || 10)}
            />
          </Col>
        </Row>
        <Row align="middle" gutter={8}>
          <Col style={{ fontWeight: 'bold' }}>跳过条数：</Col>
          <Col flex={1}>
            <InputNumber
              value={effectArgs.offset}
              onChange={(v) => updateArg(['offset'], v || 0)}
            />
          </Col>
        </Row>
        <CatchResultError
          title="查询结果"
          result={result}
          successRender={(records) => (
            <DataTable
              data={records}
              dataModel={dataModel}
              useApiName={effectArgs.useApiName}
              tableName={effectArgs.modelName}
              showAll={false}
              columns={resultTableColumns}
            />
          )}
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
