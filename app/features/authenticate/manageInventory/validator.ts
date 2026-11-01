import { z } from 'zod'
import { validationMsg } from '~/shared/utils/appUtils'

export const stockAdjustmentSchema = z.object({
  productVariantId: z.number().positive(),
  reason: z.enum(['RESTOCK', 'CORRECTION']),
  quantityChange: z
    .number({ message: validationMsg('inventory.validation.quantityChangeValidNumber') })
    .refine((val) => val !== 0, {
      message: validationMsg('inventory.validation.quantityChangeNonZero')
    })
})

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>

export const cycleCountSchema = z.object({
  productVariantId: z.number().positive(),
  physicalCount: z
    .number({ message: validationMsg('inventory.validation.physicalCountValidNumber') })
    .int(validationMsg('inventory.validation.wholeInteger'))
    .min(0, validationMsg('inventory.validation.physicalCountNegative'))
})

export type CycleCountFormValues = z.infer<typeof cycleCountSchema>
