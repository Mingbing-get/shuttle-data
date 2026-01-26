import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class StringFieldPlugin implements DataModel.FieldPlugin<'string'> {
  readonly type = 'string'
  readonly label = '字符串'
  readonly canAsDisplay = true

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('string'),
      extra: z
        .object({
          maxLength: z.number().optional().nullable(),
          unique: z.boolean().optional().nullable(),
        })
        .optional()
        .nullable(),
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
