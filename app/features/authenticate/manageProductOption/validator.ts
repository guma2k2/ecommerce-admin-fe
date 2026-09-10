import z from 'zod'
import { validationMsg } from '~/shared/utils/appUtils'

export const productOptionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, validationMsg('validation.required'))
    .max(100, validationMsg('validation.maxLength', { max: 100 }))
})

export type ProductOptionFormSchema = z.infer<typeof productOptionFormSchema>
