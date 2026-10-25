import { httpRequest } from "~/shared/services/httpRequest"
import type {
  ApiResponse,
  CreatePromotionRequest,
  GetPromotionsParams,
  PageResponse,
  PromotionDetailResponse,
  PromotionListItem,
  UpdatePromotionRequest
} from "~/shared/types"

const PROMOTIONS_BASE_URL = "/promotions/backoffice"

/**
 * Fetches a paginated list of promotions for the admin backoffice.
 * Converts UI 1-based page numbers to backend 0-based page numbers.
 */
export async function getPromotions(params: GetPromotionsParams = {}): Promise<PageResponse<PromotionListItem>> {
  const uiPageNumber = params.pageNumber ?? 1
  const zeroBasedPage = Math.max(0, uiPageNumber - 1)
  const pageSize = params.pageSize ?? 10

  const queryParams: Record<string, unknown> = {
    pageNumber: zeroBasedPage,
    pageSize
  }

  if (params.name?.trim()) {
    queryParams.name = params.name.trim()
  }
  if (params.couponCode?.trim()) {
    queryParams.couponCode = params.couponCode.trim()
  }
  if (params.isActive !== undefined) {
    queryParams.isActive = params.isActive
  }
  if (params.startDate) {
    queryParams.startDate = params.startDate
  }
  if (params.endDate) {
    queryParams.endDate = params.endDate
  }

  const response = await httpRequest.get<ApiResponse<PageResponse<PromotionListItem>>>(PROMOTIONS_BASE_URL, {
    params: queryParams
  })

  const data = response.data.data

  return {
    ...data,
    pageNumber: uiPageNumber
  }
}

/**
 * Fetches comprehensive detail of a promotion by ID.
 */
export async function getPromotionById(id: number | string): Promise<PromotionDetailResponse> {
  const response = await httpRequest.get<ApiResponse<PromotionDetailResponse>>(`${PROMOTIONS_BASE_URL}/${id}`)
  return response.data.data
}

/**
 * Creates a new promotion campaign.
 */
export async function createPromotion(payload: CreatePromotionRequest): Promise<PromotionDetailResponse> {
  const response = await httpRequest.post<ApiResponse<PromotionDetailResponse>>(PROMOTIONS_BASE_URL, payload)
  return response.data.data
}

/**
 * Updates an existing promotion by ID.
 */
export async function updatePromotion(
  id: number | string,
  payload: UpdatePromotionRequest
): Promise<PromotionDetailResponse> {
  const response = await httpRequest.put<ApiResponse<PromotionDetailResponse>>(`${PROMOTIONS_BASE_URL}/${id}`, payload)
  return response.data.data
}

/**
 * Deletes a promotion by ID.
 */
export async function deletePromotion(id: number | string): Promise<void> {
  await httpRequest.delete<ApiResponse<void>>(`${PROMOTIONS_BASE_URL}/${id}`)
}

export const promotionService = {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion
}

export default promotionService
