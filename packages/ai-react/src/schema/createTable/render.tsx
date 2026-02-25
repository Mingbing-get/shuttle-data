import { useCallback, useRef } from 'react'
import {
  TableEditorRender,
  TableEditorProps,
  TableEditorInstance,
} from '@shuttle-data/render-react'
import { DataModel } from '@shuttle-data/type'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
} from '@shuttle-ai/render-react'
import { Flex } from 'antd'

export interface CreateTableToolRenderProps extends Omit<
  TableEditorProps,
  'schema' | 'enumManager' | 'table' | 'tableName' | 'useApiName' | 'disabled'
> {}

export default function CreateTableToolRender(
  props: CreateTableToolRenderProps,
) {
  const instanceRef = useRef<TableEditorInstance>(null)
  const { dataModel } = useWorkContext()
  const { args, confirmResult, agent, toolId } = useTool<DataModel.Define>()

  const getNewArgs = useCallback(async () => {
    if (!instanceRef.current) {
      throw new Error('TableEditorRender instance is not initialized')
    }

    const value = instanceRef.current.form.getFieldsValue()

    return value
  }, [])

  const handleAfterConfirm = useCallback(() => {
    setTimeout(() => {
      dataModel.schema.clearTableList()
      if (args.name) {
        dataModel.schema.removeModelFromCache(args.name)
      }
    }, 1000)
  }, [dataModel, args.name])

  return (
    <Flex
      vertical
      gap={8}
      style={{ backgroundColor: '#fff', borderRadius: 8, padding: 8 }}
    >
      <TableEditorRender
        {...props}
        ref={instanceRef}
        style={{
          maxHeight: '60vh',
          ...props.style,
        }}
        disabled={!!confirmResult}
        schema={dataModel.schema}
        enumManager={dataModel.enumManager}
        table={confirmResult?.newArgs as any || args}
      />
      <ToolConfirmRender
        agent={agent}
        toolId={toolId}
        result={confirmResult}
        getNewArgs={getNewArgs}
        onAfterConfirm={handleAfterConfirm}
      />
    </Flex>
  )
}
