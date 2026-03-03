import { useCallback } from 'react'
import { DataForm, useTable } from '@shuttle-data/render-react'
import { DataCRUD } from '@shuttle-data/type'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
  CatchResultError,
} from '@shuttle-ai/render-react'
import { Flex, Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import './render.scss'

interface UpdateRecordParams extends DataCRUD.UpdateWithIdOption<any> {
  modelName: string
  useApiName: boolean
}

export interface UpdateRecordToolRenderProps {}

export default function UpdateRecordToolRender(
  props: UpdateRecordToolRenderProps,
) {
  const { dataModel } = useWorkContext()
  const { args, effectArgs, updateArg, confirmResult, result, agent, toolId } =
    useTool<UpdateRecordParams, string>()

  const { loading, table } = useTable(
    dataModel.schema,
    effectArgs.modelName,
    effectArgs.useApiName,
  )

  const getNewArgs = useCallback(async () => {
    if (args === effectArgs) return

    return effectArgs
  }, [args, effectArgs])

  const handleUpdateArgs = useCallback(
    (index: number, record: DataCRUD.UpdateInputWithId<any>) => {
      const newData = [...effectArgs.data]
      newData[index] = record
      updateArg(['data'], newData)
    },
    [effectArgs, updateArg],
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
        <div className="shuttle-data-tool-update-records">
          {effectArgs?.data?.map((item, index) => (
            <div key={index} className="shuttle-data-tool-update-item">
              <h4 className="shuttle-data-tool-update-item-title">
                第{index + 1}条数据
              </h4>
              <DataForm
                disabled={!!confirmResult}
                dataModel={dataModel}
                tableName={effectArgs.modelName}
                useApiName={effectArgs.useApiName}
                value={item}
                hiddenEmptyValueField
                footer={() => null}
                onValuesChange={(_, values) => handleUpdateArgs(index, values)}
              />
            </div>
          ))}
        </div>
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
