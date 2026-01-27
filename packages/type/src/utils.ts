import { z } from 'zod'

export function nameZod() {
  return z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9_]+$/)
}

export function apiNameZod() {
  return z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9_]+$/)
}

export function labelZod() {
  return z.string().max(100).optional().nullable()
}

export function uniqueArrayZod<T extends z.core.SomeType = any>(
  arrayZod: z.ZodArray<T>,
  checkFields: string[],
) {
  return arrayZod.refine((arr) => {
    checkFields.forEach((field) => {
      const values = arr.reduce((acc: any[], item: any) => {
        if (item[field] !== undefined && item[field] !== null) {
          acc.push(item[field])
        }

        return acc
      }, [])
      const uniqueValues = new Set(values)
      if (values.length !== uniqueValues.size) {
        throw new Error(`Field ${field} must be unique`)
      }
    })
    return true
  })
}
