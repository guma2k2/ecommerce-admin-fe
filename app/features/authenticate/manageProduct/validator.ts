import z from 'zod'

export const productOptionValueSchema = z.object({
  id: z.number().nullable().optional(),
  value: z.string().trim().min(1, 'Option value is required'),
  position: z.number(),
  image: z.string().optional()
})

export const productOptionSchema = z.object({
  id: z.string().optional(),
  productOptionId: z.number().optional(),
  name: z.string().trim().min(1, 'Option name is required'),
  position: z.number(),
  showing: z.boolean(),
  values: z.array(productOptionValueSchema)
})

export const productVariantSchema = z.object({
  id: z.number().nullable().optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  sku: z.string().optional(),
  price: z.number(),
  quantity: z.number(),
  mediaId: z.string().optional(),
  image: z.string().optional(),
  productOptionValueIds: z.array(z.number()).optional()
})

export const productMediaItemSchema = z.object({
  mediaId: z.string(),
  position: z.number(),
  url: z.string().optional(),
  isChecked: z.boolean().optional()
})

export const productAttributeItemSchema = z.object({
  productAttributeId: z.number(),
  name: z.string().optional(),
  value: z.string().trim().min(1, 'Attribute value is required')
})

export const productVariantFormSchema = z.object({
  options: z.array(productOptionSchema),
  variants: z.array(productVariantSchema)
})

export const productFormSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  name: z.string().trim().min(1, 'Product name is required').max(255, 'Name too long'),
  slug: z.string().trim().min(1, 'Slug is required').max(255, 'Slug too long'),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaKeyword: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryId: z.union([z.number(), z.string()]).nullable().optional(),
  brandId: z.union([z.number(), z.string()]).nullable().optional(),
  status: z.enum(['ACTIVE', 'DRAFT']),
  medias: z.array(productMediaItemSchema),
  attributes: z.array(productAttributeItemSchema),
  hasOptions: z.boolean(),
  simplePrice: z.number(),
  simpleQuantity: z.number(),
  simpleSku: z.string().optional(),
  options: z.array(productOptionSchema),
  variants: z.array(productVariantSchema)
})

export type ProductOptionValueFormType = z.infer<typeof productOptionValueSchema>
export type ProductOptionForm = z.infer<typeof productOptionSchema>
export type ProductVariantFormItem = z.infer<typeof productVariantSchema>
export type ProductMediaItemForm = z.infer<typeof productMediaItemSchema>
export type ProductAttributeItemForm = z.infer<typeof productAttributeItemSchema>
export type ProductVariantFormSchema = z.infer<typeof productVariantFormSchema>
export type ProductFormSchema = z.infer<typeof productFormSchema>
