import z from 'zod'
import { validationMsg } from '~/shared/utils/appUtils'

export const brandFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, validationMsg('validation.required'))
    .max(100, validationMsg('validation.maxLength', { max: 100 })),
  description: z
    .string()
    .trim()
    .max(500, validationMsg('validation.maxLength', { max: 500 }))
    .optional()
    .or(z.literal('')),
  image: z.string().trim().optional().or(z.literal(''))
})

export type BrandFormSchema = z.infer<typeof brandFormSchema>
