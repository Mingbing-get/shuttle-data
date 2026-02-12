import { useMemo } from 'react'
import { ModelListRender } from '@shuttle-data/render-react'
import { DataModel } from '@shuttle-data/type'
import { useWorkContext, useTool } from '@shuttle-ai/render-react'

export default function GetTableListToolRender() {
  const { dataModel } = useWorkContext()
  const { content } = useTool()

  const showTableList: Omit<DataModel.Define, 'fields'>[] = useMemo(() => {
    if (!content) return []

    if (Array.isArray(content)) {
      return content
    }

    try {
      return JSON.parse(content)
    } catch (error) {
      return []
    }
  }, [content])

  return (
    <ModelListRender
      style={{ background: '#fff', borderRadius: 8 }}
      schema={dataModel.schema}
      showTableList={showTableList}
    />
  )
}
