import { Flex, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useTable } from '@shuttle-data/render-react'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
} from '@shuttle-ai/render-react'

export interface DropTableToolRenderProps {}

export default function DropTableToolRender(props: DropTableToolRenderProps) {
  const { dataModel } = useWorkContext()
  const { args, confirmResult, agent, toolId } = useTool<{
    tableName: string
    useApiName?: boolean
  }>()

  const { loading, table } = useTable(
    dataModel.schema,
    args.tableName,
    args.useApiName,
  )

  if (loading) {
    return (
      <Flex align="center">
        <Spin
          spinning
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        />
      </Flex>
    )
  }

  return (
    <div>
      <p style={{ margin: '4px 0' }}>
        删除数据模型【{table?.label || table?.apiName || args?.tableName}】
      </p>
      <ToolConfirmRender agent={agent} toolId={toolId} result={confirmResult} />
    </div>
  )
}
