import { z } from 'zod'

export const stockAdjustmentSchema = z.object({
  productVariantId: z.number().positive(),
  reason: z.enum(['RESTOCK', 'CORRECTION']),
  quantityChange: z
    .number({ message: 'Quantity change must be a valid number' })
    .refine((val) => val !== 0, {
      message: 'Quantity change cannot be zero'
    })
})

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>

export const cycleCountSchema = z.object({
  productVariantId: z.number().positive(),
  physicalCount: z
    .number({ message: 'Physical count must be a valid number' })
    .int('Must be a whole integer')
    .min(0, 'Physical count cannot be negative')
})

export type CycleCountFormValues = z.infer<typeof cycleCountSchema>
