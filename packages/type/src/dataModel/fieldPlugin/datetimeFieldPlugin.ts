import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class DatetimeFieldPlugin implements DataModel.FieldPlugin<'datetime'> {
  readonly type = 'datetime'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('datetime'),
      extra: z
        .object({
          unique: z.boolean().optional(),
        })
        .optional(),
    })
  }
}
