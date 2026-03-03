import {
  ModelListRender,
  DataModelTableListProps,
} from '@shuttle-data/render-react'
import { DataModel } from '@shuttle-data/type'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
  CatchResultError,
} from '@shuttle-ai/render-react'

export interface GetTableListToolRenderProps extends Omit<
  DataModelTableListProps,
  'schema' | 'showTableList' | 'dataSourceName'
> {}

export default function GetTableListToolRender(
  props: GetTableListToolRenderProps,
) {
  const { dataModel } = useWorkContext()
  const { result, confirmResult, agent, toolId } = useTool<
    {},
    Omit<DataModel.Define, 'fields'>[]
  >()

  if (!result) {
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
    <CatchResultError
      title="查询结果"
      result={result}
      successRender={(tableList) => (
        <ModelListRender
          {...props}
          style={{ background: '#fff', borderRadius: 8, ...props.style }}
          schema={dataModel.schema}
          showTableList={tableList}
        />
      )}
    />
  )
}
