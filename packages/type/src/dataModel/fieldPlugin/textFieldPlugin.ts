import { z } from 'zod'

import type { DataModel } from '../type'
import baseFieldZod from './baseFieldZod'
import { DataCondition } from '../../condition'

export default class TextFieldPlugin implements DataModel.FieldPlugin<'text'> {
  readonly type = 'text'
  readonly label = '文本'
  readonly canAsDisplay = true

  getZod() {
    return baseFieldZod.extend({
      type: z.literal('text'),
      extra: z
        .object({
          unique: z.boolean().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
  }

  getTs(field: DataModel.TextField, useApiName?: boolean) {
    const key = useApiName ? field.apiName : field.name

    return `/**
 * label: ${field.label}
 * type: ${field.type}
 * name: ${field.name}
 * apiName: ${field.apiName}
 */
${key}${field.required ? '' : '?'}: string`
  }

  getSupportConditionOps() {
    const ops: Exclude<DataCondition.Op, 'and' | 'or'>[] = [
      'isNull',
      'isNotNull',
      'eq',
      'neq',
      'like',
      'notLike',
    ]

    return ops
  }
}
