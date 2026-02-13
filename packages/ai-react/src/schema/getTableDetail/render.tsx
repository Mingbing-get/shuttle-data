import { useMemo } from 'react'
import { TableEditorRender, TableEditorProps } from '@shuttle-data/render-react'
import { DataModel } from '@shuttle-data/type'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
} from '@shuttle-ai/render-react'

export interface GetTableDetailToolRenderProps extends Omit<
  TableEditorProps,
  | 'schema'
  | 'enumManager'
  | 'table'
  | 'tableName'
  | 'useApiName'
  | 'disabled'
  | 'dataSourceName'
> {}

export default function GetTableDetailToolRender(
  props: GetTableDetailToolRenderProps,
) {
  const { dataModel } = useWorkContext()
  const { args, content, confirmResult, agent, toolId } = useTool<{
    tableName: string
    useApiName?: boolean
  }>()

  const table: DataModel.Define = useMemo(() => {
    if (!content) return

    try {
      return JSON.parse(content)
    } catch (error) {
      return
    }
  }, [content])

  if (!table) {
    return (
      <div>
        <p style={{ margin: '4px 0' }}>
          获取数据模型【{args?.tableName}】的详情
        </p>
        <ToolConfirmRender
          agent={agent}
          toolId={toolId}
          result={confirmResult}
        />
      </div>
    )
  }

  return (
    <TableEditorRender
      {...props}
      style={{
        maxHeight: '60vh',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        ...props.style,
      }}
      disabled={true}
      schema={dataModel.schema}
      enumManager={dataModel.enumManager}
      table={table}
      dataSourceName={table.dataSourceName}
    />
  )
}
