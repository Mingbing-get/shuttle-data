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
        })
        .optional(),
    })
  }
}
