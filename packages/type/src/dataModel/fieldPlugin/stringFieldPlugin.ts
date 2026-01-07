import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class StringFieldPlugin implements DataModel.FieldPlugin<'string'> {
  readonly type = 'string'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('string'),
      extra: z
        .object({
          maxLength: z.number().optional(),
          unique: z.boolean().optional(),
        })
        .optional(),
    })
  }

  getTs(field: DataModel.StringField, useApiName?: boolean) {
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
