import { z } from "zod"
import { validationMsg } from "~/shared/utils/appUtils"

export const promotionFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, validationMsg("validation.required"))
      .max(100, validationMsg("validation.maxLength", { max: 100 })),
    slug: z
      .string()
      .trim()
      .min(1, validationMsg("validation.required"))
      .max(100, validationMsg("validation.maxLength", { max: 100 }))
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, validationMsg("validation.slugFormat")),
    couponCode: z
      .string()
      .trim()
      .min(1, validationMsg("validation.required"))
      .max(50, validationMsg("validation.maxLength", { max: 50 })),
    description: z.string().trim().nullable().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    usageType: z.enum(["LIMITED", "UNLIMITED"]),
    applyTo: z.enum(["ORDER", "PRODUCT", "CATEGORY", "BRAND"]),
    usageLimit: z.number().int().positive().nullable().optional(),
    usageLimitPerCustomer: z.number().int().min(1).optional(),
    discountPercentage: z.number().min(0.01).max(100).nullable().optional(),
    discountAmount: z.number().positive().nullable().optional(),
    maxDiscountAmount: z.number().positive().nullable().optional(),
    minimumOrderPurchaseAmount: z.number().nonnegative().nullable().optional(),
    isActive: z.boolean().optional(),
    startDate: z.string().min(1, validationMsg("validation.required")),
    endDate: z.string().min(1, validationMsg("validation.required")),
    targetProductIds: z.array(z.number()).optional(),
    targetCategoryIds: z.array(z.number()).optional(),
    targetBrandIds: z.array(z.number()).optional()
  })
  .superRefine((data, ctx) => {
    // Discount value validation
    if (data.discountType === "PERCENTAGE" && (data.discountPercentage == null || data.discountPercentage <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountPercentage"],
        message: validationMsg("validation.required")
      })
    }
    if (data.discountType === "FIXED" && (data.discountAmount == null || data.discountAmount <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountAmount"],
        message: validationMsg("validation.required")
      })
    }

    // Usage limit validation
    if (data.usageType === "LIMITED" && (data.usageLimit == null || data.usageLimit <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["usageLimit"],
        message: validationMsg("validation.required")
      })
    }

    // Date range validation
    if (data.startDate && data.endDate) {
      if (new Date(data.endDate) <= new Date(data.startDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: validationMsg("validation.endDateAfterStartDate")
        })
      }
    }

    // Target scope validation
    if (data.applyTo === "PRODUCT" && (!data.targetProductIds || data.targetProductIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetProductIds"],
        message: validationMsg("validation.required")
      })
    }
    if (data.applyTo === "CATEGORY" && (!data.targetCategoryIds || data.targetCategoryIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetCategoryIds"],
        message: validationMsg("validation.required")
      })
    }
    if (data.applyTo === "BRAND" && (!data.targetBrandIds || data.targetBrandIds.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetBrandIds"],
        message: validationMsg("validation.required")
      })
    }
  })

export type PromotionFormData = z.infer<typeof promotionFormSchema>
