import { useCallback, useRef } from 'react'
import {
  DataEnumGroupEditorRender,
  DataEnumGroupEditorProps,
  DataEnumGroupEditorInstance,
} from '@shuttle-data/render-react'
import { DataEnum } from '@shuttle-data/type'
import {
  useWorkContext,
  useTool,
  ToolConfirmRender,
} from '@shuttle-ai/render-react'
import { Flex } from 'antd'

export interface CreateEnumToolRenderProps extends Omit<
  DataEnumGroupEditorProps,
  'manager' | 'group' | 'enumGroupName' | 'disabled'
> {}

export default function CreateEnumToolRender(props: CreateEnumToolRenderProps) {
  const instanceRef = useRef<DataEnumGroupEditorInstance>(null)
  const { dataModel } = useWorkContext()
  const { args, confirmResult, agent, toolId } = useTool<DataEnum.Group>()

  const getNewArgs = useCallback(async () => {
    if (!instanceRef.current) {
      throw new Error('DataEnumGroupEditorRender instance is not initialized')
    }

    const value = instanceRef.current.form.getFieldsValue()

    return value
  }, [])

  const handleAfterConfirm = useCallback(() => {
    setTimeout(() => {
      dataModel.enumManager.clearGroupList()
      if (args.name) {
        dataModel.enumManager.removeGroupFromCache(args.name)
      }
    }, 1000)
  }, [dataModel, args.name])

  return (
    <Flex
      vertical
      gap={8}
      style={{ backgroundColor: '#fff', borderRadius: 8, padding: 8 }}
    >
      <DataEnumGroupEditorRender
        {...props}
        ref={instanceRef}
        style={{
          maxHeight: '60vh',
          ...props.style,
        }}
        disabled={!!confirmResult}
        manager={dataModel.enumManager}
        group={args}
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
