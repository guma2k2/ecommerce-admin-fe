import z from 'zod'
import { validationMsg } from '~/shared/utils/appUtils'

export const productAttributeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, validationMsg('validation.required'))
    .max(100, validationMsg('validation.maxLength', { max: 100 }))
})

export type ProductAttributeFormSchema = z.infer<typeof productAttributeFormSchema>
