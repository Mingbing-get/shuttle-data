import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'
import { DataCondition } from '../../condition'

export default class DateFieldPlugin implements DataModel.FieldPlugin<'date'> {
  readonly type = 'date'
  readonly label = '日期'
  readonly canAsDisplay = true

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('date'),
      extra: z
        .object({
          unique: z.boolean().optional().nullable(),
          format: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
  }

  getTs(field: DataModel.DateField, useApiName?: boolean) {
    const key = useApiName ? field.apiName : field.name

    return `/**
 * label: ${field.label}
 * type: ${field.type}
 * name: ${field.name}
 * apiName: ${field.apiName}
 */
${key}${field.required ? '' : '?'}: string`
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
