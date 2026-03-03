import { Flex, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useGroup } from '@shuttle-data/render-react'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
  CatchResultError,
} from '@shuttle-ai/render-react'

export interface DropEnumToolRenderProps {}

export default function DropEnumToolRender(props: DropEnumToolRenderProps) {
  const { dataModel } = useWorkContext()
  const { args, result, confirmResult, agent, toolId } = useTool<
    {
      enumGroupName: string
      useApiName?: boolean
    },
    string
  >()

  const { loading, group } = useGroup(
    dataModel.enumManager,
    args.enumGroupName,
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
        删除枚举组【{group?.label || group?.apiName || args?.enumGroupName}】
      </p>
      <CatchResultError
        result={result}
        successRender={(info) => <span>{info}</span>}
      />
      <ToolConfirmRender agent={agent} toolId={toolId} result={confirmResult} />
    </div>
  )
}
