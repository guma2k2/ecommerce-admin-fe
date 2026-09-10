import z from 'zod'
import { validationMsg } from '~/shared/utils/appUtils'

export const productOptionValueSchema = z.object({
  id: z.number().nullable().optional(),
  value: z.string().trim().min(1, validationMsg('validation.required')),
  position: z.number().optional()
})

export const productOptionSchema = z.object({
  id: z.union([z.number(), z.string()]).nullable().optional(),
  productOptionId: z.number().optional(),
  name: z.string().trim().min(1, validationMsg('validation.required')),
  position: z.number().optional(),
  showing: z.boolean().optional(),
  values: z.array(productOptionValueSchema)
})

export const productAttributeItemSchema = z.object({
  id: z.number().nullable().optional(),
  productAttributeId: z.number(),
  name: z.string().optional(),
  value: z.string(),
  applyTo: z.enum(['base', 'variant'])
})

export const productVariantSchema = z.object({
  id: z.number().nullable().optional(),
  title: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0, validationMsg('validation.min', { min: 0 })),
  quantity: z.number().min(0, validationMsg('validation.min', { min: 0 })),
  mediaId: z.string().nullable().optional(),
  image: z.string().optional(),
  productOptionValueIds: z.array(z.number()).optional(),
  attributes: z.array(productAttributeItemSchema).optional()
})

export const productMediaItemSchema = z.object({
  mediaId: z.string(),
  position: z.number(),
  url: z.string().optional(),
  isChecked: z.boolean().optional()
})

export const productFormSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  name: z
    .string()
    .trim()
    .min(1, validationMsg('validation.required'))
    .max(255, validationMsg('validation.maxLength', { max: 255 })),
  slug: z
    .string()
    .trim()
    .min(1, validationMsg('validation.required'))
    .max(255, validationMsg('validation.maxLength', { max: 255 })),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaKeyword: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryId: z.union([z.number(), z.string()]).nullable().optional(),
  brandId: z.union([z.number(), z.string()]).nullable().optional(),
  attributeTemplateId: z.union([z.number(), z.string()]).nullable().optional(),
  status: z.enum(['ACTIVE', 'DRAFT']),
  medias: z.array(productMediaItemSchema),
  attributes: z.array(productAttributeItemSchema),
  hasOptions: z.boolean(),
  simplePrice: z.number().min(0, validationMsg('validation.min', { min: 0 })),
  simpleQuantity: z.number().min(0, validationMsg('validation.min', { min: 0 })),
  simpleSku: z.string().optional(),
  options: z.array(productOptionSchema),
  variants: z.array(productVariantSchema).min(1, validationMsg('validation.atLeastOneVariant'))
})

export type ProductOptionValueFormType = z.infer<typeof productOptionValueSchema>
export type ProductOptionForm = z.infer<typeof productOptionSchema>
export type ProductVariantFormItem = z.infer<typeof productVariantSchema>
export type ProductMediaItemForm = z.infer<typeof productMediaItemSchema>
export type ProductAttributeItemForm = z.infer<typeof productAttributeItemSchema>
export type ProductFormSchema = z.infer<typeof productFormSchema>
