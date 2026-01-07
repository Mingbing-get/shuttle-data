import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class DateFieldPlugin implements DataModel.FieldPlugin<'date'> {
  readonly type = 'date'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('date'),
      extra: z
        .object({
          unique: z.boolean().optional(),
          format: z.string().optional(),
        })
        .optional(),
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
}
