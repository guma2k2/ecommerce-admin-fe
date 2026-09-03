import z from 'zod'

export const productAttributeTemplateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be under 100 characters'),
  attributeIds: z.array(z.union([z.string(), z.number()]))
})

export type ProductAttributeTemplateFormSchema = z.infer<typeof productAttributeTemplateFormSchema>
