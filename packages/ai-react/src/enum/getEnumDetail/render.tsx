import { useMemo } from 'react'
import {
  DataEnumGroupEditorRender,
  DataEnumGroupEditorProps,
} from '@shuttle-data/render-react'
import { DataEnum } from '@shuttle-data/type'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
} from '@shuttle-ai/render-react'

export interface GetEnumDetailToolRenderProps extends Omit<
  DataEnumGroupEditorProps,
  'manager' | 'group' | 'enumGroupName' | 'useApiName' | 'disabled'
> {}

export default function GetEnumDetailToolRender(
  props: GetEnumDetailToolRenderProps,
) {
  const { dataModel } = useWorkContext()
  const { args, content, confirmResult, agent, toolId } = useTool<{
    groupName: string
    useApiName?: boolean
  }>()

  const group: DataEnum.Group = useMemo(() => {
    if (!content) return

    try {
      return JSON.parse(content)
    } catch (error) {
      return
    }
  }, [content])

  if (!group) {
    return (
      <div>
        <p style={{ margin: '4px 0' }}>获取枚举组【{args?.groupName}】的详情</p>
        <ToolConfirmRender
          agent={agent}
          toolId={toolId}
          result={confirmResult}
        />
      </div>
    )
  }

  return (
    <DataEnumGroupEditorRender
      {...props}
      style={{
        maxHeight: '60vh',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        ...props.style,
      }}
      disabled={true}
      manager={dataModel.enumManager}
      group={group}
    />
  )
}
