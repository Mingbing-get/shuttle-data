import z from 'zod'

export const withIdValueZod = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.object({ _id: z.string() }),
])
