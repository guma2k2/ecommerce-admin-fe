import { z } from 'zod'

export const mediaUploadSchema = z.object({
  altText: z.string().trim().max(255, 'Alt text must not exceed 255 characters').optional()
})

export type MediaUploadSchema = z.infer<typeof mediaUploadSchema>
