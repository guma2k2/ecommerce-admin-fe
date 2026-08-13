import z from 'zod'

export const brandFormSchema = z.object({
  name: z.string().trim().min(1, 'Brand name is required').max(100, 'Brand name must be under 100 characters'),
  image: z.string().trim().optional().or(z.literal(''))
})

export type BrandFormSchema = z.infer<typeof brandFormSchema>
