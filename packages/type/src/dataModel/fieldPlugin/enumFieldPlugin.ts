import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'
import { DataCondition } from '../../condition'

export default class EnumFieldPlugin implements DataModel.FieldPlugin<'enum'> {
  readonly type = 'enum'
  readonly label = '枚举'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('enum'),
      extra: z.object({
        groupName: z
          .string()
          .describe('Note: this refers to the enum group name, not apiName'),
        multiple: z.boolean().optional().nullable(),
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

  getSupportConditionOps(field: DataModel.EnumField) {
    const ops: Exclude<DataCondition.Op, 'and' | 'or'>[] = field.extra?.multiple
      ? [
          'isNull',
          'isNotNull',
          'contains',
          'notContains',
          'hasAnyOf',
          'notAnyOf',
        ]
      : ['isNull', 'isNotNull', 'eq', 'neq', 'in', 'notIn']

    return ops
  }

  private capitalizeFirstLetter(str: string): string {
    if (!str) return str // 处理空字符串
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}
