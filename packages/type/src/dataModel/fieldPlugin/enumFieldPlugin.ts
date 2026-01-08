import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class EnumFieldPlugin implements DataModel.FieldPlugin<'enum'> {
  readonly type = 'enum'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('enum'),
      extra: z.object({
        groupName: z.string(),
        multiple: z.boolean().optional(),
      }),
    })
  }

  getTs(field: DataModel.EnumField, useApiName?: boolean) {
    const key = useApiName ? field.apiName : field.name

    const enumTypeName = `${this.capitalizeFirstLetter(field.extra?.groupName || '')}_enum${useApiName ? '_api' : ''}`

    return `/**
 * label: ${field.label}
 * type: ${field.type}
 * name: ${field.name}
 * apiName: ${field.apiName}
 */
${key}${field.required ? '' : '?'}: ${enumTypeName}${field.extra?.multiple ? '[]' : ''}`
  }

  private capitalizeFirstLetter(str: string): string {
    if (!str) return str // 处理空字符串
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}
