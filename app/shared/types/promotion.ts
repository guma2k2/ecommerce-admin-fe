import type { PageResponse, PaginationParams } from "./pagination"

export type DiscountType = "PERCENTAGE" | "FIXED"
export type UsageType = "LIMITED" | "UNLIMITED"
export type ApplyTo = "ORDER" | "PRODUCT" | "CATEGORY" | "BRAND"

export interface PromotionListItem {
  id: number
  name: string
  slug: string
  description: string | null
  couponCode: string
  discountType: DiscountType
  usageType: UsageType
  applyTo: ApplyTo
  usageLimit: number | null
  usageCount: number
  usageLimitPerCustomer: number
  discountPercentage: number | null
  discountAmount: number | null
  maxDiscountAmount: number | null
  minimumOrderPurchaseAmount: number | null
  isActive: boolean
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface PromotionDetailResponse extends PromotionListItem {
  targetProductIds: number[]
  targetCategoryIds: number[]
  targetBrandIds: number[]
  stripeCouponId: string | null
  stripePromotionCodeId: string | null
}

export interface CreatePromotionRequest {
  name: string
  slug: string
  description?: string | null
  couponCode: string
  discountType: DiscountType
  usageType: UsageType
  applyTo: ApplyTo
  usageLimit?: number | null
  usageLimitPerCustomer?: number
  discountPercentage?: number | null
  discountAmount?: number | null
  maxDiscountAmount?: number | null
  minimumOrderPurchaseAmount?: number | null
  isActive?: boolean
  startDate: string
  endDate: string
  targetProductIds?: number[]
  targetCategoryIds?: number[]
  targetBrandIds?: number[]
}

export type UpdatePromotionRequest = CreatePromotionRequest

export interface GetPromotionsParams extends PaginationParams {
  name?: string
  couponCode?: string
  isActive?: boolean
  startDate?: string
  endDate?: string
}

export type PaginatedPromotionsResponse = PageResponse<PromotionListItem>
