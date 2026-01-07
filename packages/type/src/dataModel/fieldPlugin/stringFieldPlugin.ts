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
}
