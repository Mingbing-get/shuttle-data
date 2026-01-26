import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class BooleanFieldPlugin implements DataModel.FieldPlugin<'boolean'> {
  readonly type = 'boolean'
  readonly label = '布尔'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('boolean'),
      extra: z
        .object({
          trueText: z.string().optional().nullable(),
          falseText: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
  }

  getTs(field: DataModel.BooleanField, useApiName?: boolean) {
    const key = useApiName ? field.apiName : field.name

    return `/**
 * label: ${field.label}
 * type: ${field.type}
 * name: ${field.name}
 * apiName: ${field.apiName}
 */
${key}${field.required ? '' : '?'}: boolean`
  }
}
