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
}
