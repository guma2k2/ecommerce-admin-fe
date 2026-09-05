import z from 'zod'

export const productOptionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Option name is required')
    .max(100, 'Option name must be under 100 characters')
})

export type ProductOptionFormSchema = z.infer<typeof productOptionFormSchema>
