import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'
import { DataCondition } from '../../condition'

export default class LookupFieldPlugin implements DataModel.FieldPlugin<'lookup'> {
  readonly type = 'lookup'
  readonly label = '关联对象'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('lookup'),
      extra: z.object({
        modalName: z
          .string()
          .describe('Note: this refers to the modal name, not apiName'),
        multiple: z.boolean().optional().nullable(),
        unique: z.boolean().optional().nullable(),
      }),
    })
  }

  getTs(field: DataModel.LookupField, useApiName?: boolean) {
    const key = useApiName ? field.apiName : field.name

    const modalName = `${this.capitalizeFirstLetter(field.extra?.modalName || '')}_model${useApiName ? '_api' : ''}`

    return `/**
 * label: ${field.label}
 * type: ${field.type}
 * name: ${field.name}
 * apiName: ${field.apiName}
 */
${key}${field.required ? '' : '?'}: ${modalName}${field.extra?.multiple ? '[]' : ''}`
  }

  getSupportConditionOps(field: DataModel.LookupField) {
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
