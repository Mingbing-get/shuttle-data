import { useCallback } from 'react'
import {
  DataCondition,
  ConditionRenderProps,
  useTable,
} from '@shuttle-data/render-react'
import { DataCRUD } from '@shuttle-data/type'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
} from '@shuttle-ai/render-react'
import { Flex, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

interface CountRecordParams extends DataCRUD.CountOption<any> {
  modelName: string
  useApiName: boolean
}

export interface CountRenderProps extends Pick<
  ConditionRenderProps,
  'style' | 'className'
> {}

export default function CountRender(props: CountRenderProps) {
  const { dataModel } = useWorkContext()
  const { args, confirmResult, agent, toolId } = useTool<CountRecordParams>()

  const { loading, table } = useTable(
    dataModel.schema,
    args.modelName,
    args.useApiName,
  )

  const getNewArgs = useCallback(async () => {}, [])

  return (
    <Spin indicator={<LoadingOutlined spin />} spinning={loading}>
      <Flex
        vertical
        gap={8}
        style={{ backgroundColor: '#fff', borderRadius: 8, padding: 8 }}
      >
        <DataCondition
          {...props}
          disabled={!!confirmResult}
          condition={args.condition}
          dataModel={dataModel}
          useApiName={args.useApiName}
          fields={table?.fields || []}
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
