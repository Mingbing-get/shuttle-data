import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class NumberFieldPlugin implements DataModel.FieldPlugin<'number'> {
  readonly type = 'number'
  readonly label = '整数'
  readonly canAsDisplay = true

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('number'),
      extra: z
        .object({
          autoIncrement: z.boolean().optional().nullable(),
          unique: z.boolean().optional().nullable(),
          min: z.number().optional().nullable(),
          max: z.number().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
  }

  getTs(field: DataModel.NumberField, useApiName?: boolean) {
    const key = useApiName ? field.apiName : field.name

    return `/**
 * label: ${field.label}
 * type: ${field.type}
 * name: ${field.name}
 * apiName: ${field.apiName}
 */
${key}${field.required && !field.extra?.autoIncrement ? '' : '?'}: number`
  }
}
