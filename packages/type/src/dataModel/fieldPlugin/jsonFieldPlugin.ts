import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'

export default class JsonFieldPlugin implements DataModel.FieldPlugin<'json'> {
  readonly type = 'json'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('json'),
    })
  }
}
