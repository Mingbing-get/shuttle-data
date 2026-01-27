import { z } from 'zod'
import { nameZod, apiNameZod, labelZod } from '../../utils'

const baseFieldZod = z
  .object({
    name: nameZod(),
    apiName: apiNameZod(),
    label: labelZod(),
    required: z.boolean().optional().nullable(),
    isSystem: z.boolean().optional().nullable(),
    order: z.number().optional().nullable(),
  })
  .catchall(z.any())

export default baseFieldZod
