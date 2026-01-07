import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class TextFieldPlugin implements DataModel.FieldPlugin<'text'> {
  readonly type = 'text'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('text'),
      extra: z
        .object({
          unique: z.boolean().optional(),
        })
        .optional(),
    })
  }

  getTs(field: DataModel.TextField, useApiName?: boolean) {
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
