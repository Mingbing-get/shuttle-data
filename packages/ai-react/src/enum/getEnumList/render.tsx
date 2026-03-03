import { useMemo } from 'react'
import {
  DataEnumGroupListRender,
  DataEnumGroupListProps,
} from '@shuttle-data/render-react'
import { DataEnum } from '@shuttle-data/type'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
} from '@shuttle-ai/render-react'

export interface GetEnumListToolRenderProps extends Omit<
  DataEnumGroupListProps,
  'manager' | 'showEnumGroupList'
> {}

export default function GetEnumListToolRender(
  props: GetEnumListToolRenderProps,
) {
  const { dataModel } = useWorkContext()
  const { result, confirmResult, agent, toolId } = useTool()

  const showEnumGroupList: Omit<DataEnum.Group, 'fields'>[] | undefined =
    useMemo(() => {
      if (!result?.content) return

      if (Array.isArray(result.content)) {
        return result.content
      }

      try {
        return JSON.parse(result.content)
      } catch (error) {}
    }, [result])

  if (!showEnumGroupList) {
    return (
      <div>
        <p style={{ margin: '4px 0' }}>获取枚举列表</p>
        <ToolConfirmRender
          agent={agent}
          toolId={toolId}
          result={confirmResult}
        />
      </div>
    )
  }

  return (
    <DataEnumGroupListRender
      {...props}
      style={{ background: '#fff', borderRadius: 8, ...props.style }}
      manager={dataModel.enumManager}
      showEnumGroupList={showEnumGroupList}
    />
  )
}
