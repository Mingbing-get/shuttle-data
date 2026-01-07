import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class DoubleFieldPlugin implements DataModel.FieldPlugin<'double'> {
  readonly type = 'double'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('double'),
      extra: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
          decimal: z.number().optional(),
        })
        .optional(),
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
}
