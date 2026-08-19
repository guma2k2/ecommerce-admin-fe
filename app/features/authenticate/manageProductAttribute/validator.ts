import z from 'zod'

export const productAttributeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Attribute name is required')
    .max(100, 'Attribute name must be under 100 characters')
})

export type ProductAttributeFormSchema = z.infer<typeof productAttributeFormSchema>
