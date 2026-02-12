import { useMemo } from 'react'
import { TableEditorRender } from '@shuttle-data/render-react'
import { DataModel } from '@shuttle-data/type'
import { useWorkContext, useTool } from '@shuttle-ai/render-react'

export default function GetTableDetailToolRender() {
  const { dataModel } = useWorkContext()
  const { content } = useTool()

  const table: DataModel.Define = useMemo(() => {
    if (!content) return

    try {
      return JSON.parse(content)
    } catch (error) {
      return
    }
  }, [content])

  if (!table) return null

  return (
    <TableEditorRender
      style={{
        maxHeight: '60vh',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
      }}
      disabled={true}
      schema={dataModel.schema}
      enumManager={dataModel.enumManager}
      table={table}
      dataSourceName={table.dataSourceName}
    />
  )
}
