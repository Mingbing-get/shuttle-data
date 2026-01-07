import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class EnumFieldPlugin implements DataModel.FieldPlugin<'enum'> {
  readonly type = 'enum'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('enum'),
      extra: z.object({
        groupName: z.string(),
        multiple: z.boolean().optional(),
      }),
    })
  }
}
