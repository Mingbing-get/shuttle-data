import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class NumberFieldPlugin implements DataModel.FieldPlugin<'number'> {
  readonly type = 'number'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('number'),
      extra: z
        .object({
          autoIncrement: z.boolean().optional(),
          unique: z.boolean().optional(),
        })
        .optional(),
    })
  }
}
