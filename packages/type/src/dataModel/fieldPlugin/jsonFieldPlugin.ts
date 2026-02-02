import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'
import { DataCondition } from '../../condition'

export default class JsonFieldPlugin implements DataModel.FieldPlugin<'json'> {
  readonly type = 'json'
  readonly label = 'JSON'

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('json'),
    })
  }

  getTs(field: DataModel.JsonField, useApiName?: boolean) {
    const key = useApiName ? field.apiName : field.name

    return `/**
 * label: ${field.label}
 * type: ${field.type}
 * name: ${field.name}
 * apiName: ${field.apiName}
 */
${key}${field.required ? '' : '?'}: any`
  }

  getSupportConditionOps() {
    const ops: Exclude<DataCondition.Op, 'and' | 'or'>[] = [
      'isNull',
      'isNotNull',
    ]

    return ops
  }
}
