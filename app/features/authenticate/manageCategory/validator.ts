import z from "zod"

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(100, "Category name must be under 100 characters"),
  parentId: z.string().nullable().optional()
})

export type CategoryFormSchema = z.infer<typeof categoryFormSchema>
