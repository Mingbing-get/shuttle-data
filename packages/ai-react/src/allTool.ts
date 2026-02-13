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

interface AllToolOptions {
  getTableListTool?: DefinePropsRunTool<GetTableListToolRenderProps>
  getTableDetailTool?: DefinePropsRunTool<GetTableDetailToolRenderProps>
  createTableTool?: DefinePropsRunTool<CreateTableToolRenderProps>
  dropTableTool?: DefinePropsRunTool<DropTableToolRenderProps>
  updateTableTool?: DefinePropsRunTool<CreateTableToolRenderProps>
}

export default function allTool(options?: AllToolOptions) {
  return [
    deepMerge(getTableListTool, options?.getTableListTool),
    deepMerge(getTableDetailTool, options?.getTableDetailTool),
    deepMerge(createTableTool, options?.createTableTool),
    deepMerge(dropTableTool, options?.dropTableTool),
    deepMerge(updateTableTool, options?.updateTableTool),
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
