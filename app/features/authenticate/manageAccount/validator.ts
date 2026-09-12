import z from 'zod'
import { validationMsg } from '~/shared/utils/appUtils'

export const accountProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, validationMsg('validation.required'))
    .max(100, validationMsg('validation.maxLength', { max: 100 })),
  avatar: z
    .string()
    .trim()
    .max(500, validationMsg('validation.maxLength', { max: 500 }))
    .optional()
    .or(z.literal(''))
})

export type AccountProfileSchema = z.infer<typeof accountProfileSchema>
