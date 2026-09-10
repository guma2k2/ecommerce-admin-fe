import z from 'zod'
import { validationMsg } from '~/shared/utils/appUtils'

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, validationMsg('validation.required'))
    .max(100, validationMsg('validation.maxLength', { max: 100 })),
  parentId: z.union([z.number(), z.string()]).nullable().optional()
})

export type CategoryFormSchema = z.infer<typeof categoryFormSchema>
