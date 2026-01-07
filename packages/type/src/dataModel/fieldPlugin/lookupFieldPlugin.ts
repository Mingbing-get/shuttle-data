import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class LookupFieldPlugin implements DataModel.FieldPlugin<'lookup'> {
  readonly type = 'lookup'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('lookup'),
      extra: z.object({
        modalName: z.string(),
        multiple: z.boolean().optional(),
        unique: z.boolean().optional(),
      }),
    })
  }
}
