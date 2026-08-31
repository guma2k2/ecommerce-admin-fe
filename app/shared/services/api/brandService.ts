import apiClient from '~/shared/services/axiosClient'
import type {
  ApiResponse,
  BrandCreateRequest,
  BrandItem,
  BrandResponse,
  BrandUpdateRequest,
  GetBrandsParams,
  PageResponse,
  PaginationParams,
  PaginatedBrandsResponse
} from '~/shared/types'

export type { BrandItem, BrandResponse, BrandCreateRequest, BrandUpdateRequest, GetBrandsParams, PaginatedBrandsResponse }

/**
 * Fetches a paginated list of brands from the backend API.
 * Uses 0-based page numbering as required by backend.
 */
export async function getBrandsPage(
  params: PaginationParams & { search?: string } = {}
): Promise<PageResponse<BrandResponse>> {
  const pageNumber = params.pageNumber !== undefined ? Math.max(0, params.pageNumber) : 0
  const pageSize = params.pageSize ?? 10

  const response = await apiClient.get<ApiResponse<PageResponse<BrandResponse>>>('/brands/page', {
    params: {
      pageNumber,
      pageSize,
      ...(params.search?.trim() ? { search: params.search.trim() } : {})
    }
  })

  return response.data.data
}

/**
 * Helper for React Router clientLoader & UI components using 1-based page numbers.
 */
export async function getBrands(
  params: GetBrandsParams = {}
): Promise<PageResponse<BrandResponse>> {
  const uiPageNumber = params.pageNumber ?? 1
  const zeroBasedPage = Math.max(0, uiPageNumber - 1)
  const pageSize = params.pageSize ?? 10

  const response = await apiClient.get<ApiResponse<PageResponse<BrandResponse>>>('/brands/page', {
    params: {
      pageNumber: zeroBasedPage,
      pageSize,
      ...(params.search?.trim() ? { search: params.search.trim() } : {})
    }
  })

  const data = response.data.data

  let content = data.content || []
  if (params.search?.trim()) {
    const term = params.search.trim().toLowerCase()
    content = content.filter((b) => b.name.toLowerCase().includes(term))
  }

  if (params.sortField) {
    content = [...content].sort((a, b) => {
      const field = params.sortField as keyof BrandResponse
      const valA = String(a[field] ?? '')
      const valB = String(b[field] ?? '')
      const comp = valA.localeCompare(valB)
      return params.sortDir === 'desc' ? -comp : comp
    })
  }

  return {
    ...data,
    content,
    pageNumber: uiPageNumber
  }
}

/**
 * Fetches a single brand by ID.
 */
export async function getBrandById(brandId: number | string): Promise<BrandResponse> {
  const response = await apiClient.get<ApiResponse<BrandResponse>>(`/brands/${brandId}`)
  return response.data.data
}

/**
 * Creates a new brand entity.
 */
export async function createBrand(payload: BrandCreateRequest): Promise<void> {
  await apiClient.post<ApiResponse<void>>('/brands', {
    name: payload.name.trim(),
    description: payload.description?.trim() || null
  })
}

/**
 * Updates an existing brand by ID.
 */
export async function updateBrand(
  brandId: number | string,
  payload: BrandUpdateRequest
): Promise<void> {
  await apiClient.put<ApiResponse<void>>(`/brands/${brandId}`, {
    name: payload.name.trim(),
    description: payload.description?.trim() || null
  })
}

/**
 * Deletes a brand by ID.
 */
export async function deleteBrand(brandId: number | string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/brands/${brandId}`)
}

/**
 * Fetches all brands for selection dropdowns.
 */
export async function getAllBrands(): Promise<BrandResponse[]> {
  try {
    const res = await getBrandsPage({ pageNumber: 0, pageSize: 1000 })
    return res.content || []
  } catch (err) {
    console.error('Failed to load all brands:', err)
    return []
  }
}

export const brandService = {
  getBrandsPage,
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  getAllBrands
}

export default brandService
