import z from 'zod'
import { validationMsg } from '~/shared/utils/appUtils'

export const productAttributeTemplateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, validationMsg('validation.required'))
    .max(100, validationMsg('validation.maxLength', { max: 100 })),
  attributeIds: z.array(z.union([z.string(), z.number()]))
})

export type ProductAttributeTemplateFormSchema = z.infer<typeof productAttributeTemplateFormSchema>
