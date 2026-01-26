import { z } from 'zod'

const baseFieldZod = z
  .object({
    name: z.string(),
    apiName: z.string(),
    label: z.string().optional().nullable(),
    required: z.boolean().optional().nullable(),
    isSystem: z.boolean().optional().nullable(),
    order: z.number().optional().nullable(),
  })
  .catchall(z.any())

export default baseFieldZod
