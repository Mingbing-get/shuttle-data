import { ShuttleAi } from '@shuttle-ai/type'
import {
  getTableListTool,
  getTableDetailTool,
  createTableTool,
  dropTableTool,
  updateTableTool,
  GetTableListToolRenderProps,
  GetTableDetailToolRenderProps,
  CreateTableToolRenderProps,
  DropTableToolRenderProps,
} from './schema'
import {
  getEnumListTool,
  getEnumDetailTool,
  createEnumTool,
  dropEnumTool,
  updateEnumTool,
  GetEnumListToolRenderProps,
  GetEnumDetailToolRenderProps,
  CreateEnumToolRenderProps,
  DropEnumToolRenderProps,
} from './enum'
import {
  countTool,
  findRecordsTool,
  CountToolRenderProps,
  FindRecordsToolRenderProps,
  queryGroupByTool,
  QueryGroupByToolRenderProps,
  batchCreateRecordsTool,
  BatchCreateRecordToolRenderProps,
  createRecordTool,
  CreateRecordToolRenderProps,
  deleteRecordTool,
  DeleteRecordToolRenderProps,
  updateRecordsTool,
  UpdateRecordToolRenderProps,
  conditionUpdateRecordsTool,
  ConditionUpdateRecordToolRenderProps,
} from './crud'

interface AllToolOptions {
  getTableListTool?: DefinePropsRunTool<GetTableListToolRenderProps>
  getTableDetailTool?: DefinePropsRunTool<GetTableDetailToolRenderProps>
  createTableTool?: DefinePropsRunTool<CreateTableToolRenderProps>
  dropTableTool?: DefinePropsRunTool<DropTableToolRenderProps>
  updateTableTool?: DefinePropsRunTool<CreateTableToolRenderProps>
  getEnumListTool?: DefinePropsRunTool<GetEnumListToolRenderProps>
  getEnumDetailTool?: DefinePropsRunTool<GetEnumDetailToolRenderProps>
  createEnumTool?: DefinePropsRunTool<CreateEnumToolRenderProps>
  dropEnumTool?: DefinePropsRunTool<DropEnumToolRenderProps>
  updateEnumTool?: DefinePropsRunTool<CreateEnumToolRenderProps>
  countTool?: DefinePropsRunTool<CountToolRenderProps>
  findRecordsTool?: DefinePropsRunTool<FindRecordsToolRenderProps>
  queryGroupByTool?: DefinePropsRunTool<QueryGroupByToolRenderProps>
  batchCreateRecordsTool?: DefinePropsRunTool<BatchCreateRecordToolRenderProps>
  createRecordTool?: DefinePropsRunTool<CreateRecordToolRenderProps>
  deleteRecordTool?: DefinePropsRunTool<DeleteRecordToolRenderProps>
  updateRecordsTool?: DefinePropsRunTool<UpdateRecordToolRenderProps>
  conditionUpdateRecordsTool?: DefinePropsRunTool<ConditionUpdateRecordToolRenderProps>
}

export default function allTool(options?: AllToolOptions) {
  return [
    deepMerge(getTableListTool, options?.getTableListTool),
    deepMerge(getTableDetailTool, options?.getTableDetailTool),
    deepMerge(createTableTool, options?.createTableTool),
    deepMerge(dropTableTool, options?.dropTableTool),
    deepMerge(updateTableTool, options?.updateTableTool),
    deepMerge(getEnumListTool, options?.getEnumListTool),
    deepMerge(getEnumDetailTool, options?.getEnumDetailTool),
    deepMerge(createEnumTool, options?.createEnumTool),
    deepMerge(dropEnumTool, options?.dropEnumTool),
    deepMerge(updateEnumTool, options?.updateEnumTool),
    deepMerge(countTool, options?.countTool),
    deepMerge(findRecordsTool, options?.findRecordsTool),
    deepMerge(queryGroupByTool, options?.queryGroupByTool),
    deepMerge(batchCreateRecordsTool, options?.batchCreateRecordsTool),
    deepMerge(createRecordTool, options?.createRecordTool),
    deepMerge(deleteRecordTool, options?.deleteRecordTool),
    deepMerge(updateRecordsTool, options?.updateRecordsTool),
    deepMerge(conditionUpdateRecordsTool, options?.conditionUpdateRecordsTool),
  ]
}

function deepMerge<T>(target: T, source?: DeepPartial<T>): T {
  if (source === undefined) {
    return target
  }

  if (target === undefined) {
    return source as T
  }

  if (typeof target !== 'object' || target === null) {
    return source as T
  }
  if (typeof source !== 'object' || source === null) {
    return source as T
  }
  const output = { ...target }
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      if (sourceValue === undefined) {
        delete (output as any)[key]
      } else {
        ;(output as any)[key] = deepMerge((output as any)[key], sourceValue)
      }
    }
  }
  return output
}

interface DefinePropsRunToolRender<T extends Record<string, any>> extends Omit<
  ShuttleAi.Client.Agent.RenderTool,
  'defaultProps'
> {
  defaultProps?:
    | T
    | ((params: { args: Record<string, any>; content?: string }) => T)
}

interface DefinePropsRunTool<T extends Record<string, any>> extends Omit<
  Partial<ShuttleAi.Client.Agent.WithRunTool>,
  'run'
> {
  run?:
    | Partial<ShuttleAi.Client.Agent.FnTool>
    | Partial<DefinePropsRunToolRender<T>>
}

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T
