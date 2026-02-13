import { useMemo } from 'react'
import {
  ModelListRender,
  DataModelTableListProps,
} from '@shuttle-data/render-react'
import { DataModel } from '@shuttle-data/type'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
} from '@shuttle-ai/render-react'

export interface GetTableListToolRenderProps extends Omit<
  DataModelTableListProps,
  'schema' | 'showTableList' | 'dataSourceName'
> {}

export default function GetTableListToolRender(
  props: GetTableListToolRenderProps,
) {
  const { dataModel } = useWorkContext()
  const { content, confirmResult, agent, toolId } = useTool()

  const showTableList: Omit<DataModel.Define, 'fields'>[] | undefined =
    useMemo(() => {
      if (!content) return

      if (Array.isArray(content)) {
        return content
      }

      try {
        return JSON.parse(content)
      } catch (error) {}
    }, [content])

  if (!showTableList) {
    return (
      <div>
        <p style={{ margin: '4px 0' }}>获取数据模型列表</p>
        <ToolConfirmRender
          agent={agent}
          toolId={toolId}
          result={confirmResult}
        />
      </div>
    )
  }

  return (
    <ModelListRender
      {...props}
      style={{ background: '#fff', borderRadius: 8, ...props.style }}
      schema={dataModel.schema}
      showTableList={showTableList}
    />
  )
}
