import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class BooleanFieldPlugin implements DataModel.FieldPlugin<'boolean'> {
  readonly type = 'boolean'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('boolean'),
    })
  }
}
