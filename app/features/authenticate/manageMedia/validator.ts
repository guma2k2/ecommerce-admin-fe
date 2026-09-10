import { z } from 'zod'
import { validationMsg } from '~/shared/utils/appUtils'

export const mediaUploadSchema = z.object({
  altText: z
    .string()
    .trim()
    .max(255, validationMsg('validation.maxLength', { max: 255 }))
    .optional()
})

export type MediaUploadSchema = z.infer<typeof mediaUploadSchema>
