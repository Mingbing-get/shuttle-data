import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class DoubleFieldPlugin implements DataModel.FieldPlugin<'double'> {
  readonly type = 'double'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('double'),
    })
  }
}
