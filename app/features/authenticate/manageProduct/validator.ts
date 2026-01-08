import z from 'zod'
export type ProductFormSchema = z.infer<typeof productFormSchema>
export type ProductVariantFormSchema = z.infer<typeof productVariantFormSchema>
export const productFormSchema = z.object({
  title: z.string().trim().min(1).max(255),
  medias: z.array(z.object({ id: z.string(), url: z.string() })),
  description: z.string()
})

export const productValue = z.object({
  value: z.string().trim().min(1, 'This field is required'),
  position: z.number(),
  image: z.string()
})

export const productOption = z.object({
  name: z.string().trim().min(1, 'This field is required'),
  position: z.number(),
  showing: z.boolean(),
  values: z.array(productValue)
})

export const productVariant = z.object({
  name: z.string().trim().min(1, 'This field is required'),
  price: z.number(),
  quantity: z.number(),
  image: z.string()
})

export const productVariantFormSchema = z.object({
  options: z.array(productOption),
  variants: z.array(productVariant)
})
