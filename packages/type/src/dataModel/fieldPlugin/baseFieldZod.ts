import { z } from 'zod'

const baseFieldZod = z
  .object({
    name: z.string(),
    apiName: z.string(),
    label: z.string().optional(),
    required: z.boolean().optional(),
    isSystem: z.boolean().optional(),
  })
  .catchall(z.any())

export default baseFieldZod
