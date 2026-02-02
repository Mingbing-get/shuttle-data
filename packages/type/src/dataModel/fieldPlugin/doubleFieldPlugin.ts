import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'
import { DataCondition } from '../../condition'

export default class DoubleFieldPlugin implements DataModel.FieldPlugin<'double'> {
  readonly type = 'double'
  readonly label = '浮点数'
  readonly canAsDisplay = true

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('double'),
      extra: z
        .object({
          min: z.number().optional().nullable(),
          max: z.number().optional().nullable(),
          decimal: z.number().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
  }

  getTs(field: DataModel.DoubleField, useApiName?: boolean) {
    const key = useApiName ? field.apiName : field.name

    return `/**
 * label: ${field.label}
 * type: ${field.type}
 * name: ${field.name}
 * apiName: ${field.apiName}
 */
${key}${field.required ? '' : '?'}: number`
  }

  getSupportConditionOps() {
    const ops: Exclude<DataCondition.Op, 'and' | 'or'>[] = [
      'isNull',
      'isNotNull',
      'eq',
      'neq',
      'gt',
      'lt',
      'gte',
      'lte',
      'in',
      'notIn',
    ]

    return ops
  }
}
