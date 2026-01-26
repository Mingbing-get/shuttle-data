import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class DatetimeFieldPlugin implements DataModel.FieldPlugin<'datetime'> {
  readonly type = 'datetime'
  readonly label = '日期时间'
  readonly canAsDisplay = true

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('datetime'),
      extra: z
        .object({
          unique: z.boolean().optional().nullable(),
          format: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
  }

  getTs(field: DataModel.DateTimeField, useApiName?: boolean) {
    const key = useApiName ? field.apiName : field.name

    return `/**
 * label: ${field.label}
 * type: ${field.type}
 * name: ${field.name}
 * apiName: ${field.apiName}
 */
${key}${field.required ? '' : '?'}: number`
  }
}
