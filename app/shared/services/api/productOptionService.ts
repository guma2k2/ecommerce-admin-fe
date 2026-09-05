import apiClient from '~/shared/services/axiosClient'
import type {
  ApiResponse,
  PageResponse,
  PaginationParams,
  ProductOptionCreateRequest,
  ProductOptionItem,
  ProductOptionResponse,
  ProductOptionUpdateRequest
} from '~/shared/types'

export type {
  ProductOptionCreateRequest,
  ProductOptionItem,
  ProductOptionResponse,
  ProductOptionUpdateRequest
}

/**
 * Fetches a paginated list of product options (0-based pageNumber).
 */
export async function getOptionsPage(
  params: PaginationParams & { search?: string } = {}
): Promise<PageResponse<ProductOptionResponse>> {
  const pageNumber = params.pageNumber !== undefined ? Math.max(0, params.pageNumber) : 0
  const pageSize = params.pageSize ?? 10

  const response = await apiClient.get<ApiResponse<PageResponse<ProductOptionResponse>>>(
    '/product-options/page',
    {
      params: {
        pageNumber,
        pageSize,
        ...(params.search?.trim() ? { search: params.search.trim() } : {})
      }
    }
  )

  return response.data.data
}

/**
 * Helper for React Router clientLoader & UI components using 1-based page numbers.
 */
export async function getProductOptions(
  params: {
    pageNumber?: number
    pageSize?: number
    search?: string
    sortField?: string
    sortDir?: 'asc' | 'desc'
  } = {}
): Promise<PageResponse<ProductOptionResponse>> {
  const uiPageNumber = params.pageNumber ?? 1
  const zeroBasedPage = Math.max(0, uiPageNumber - 1)
  const pageSize = params.pageSize ?? 10

  const response = await apiClient.get<ApiResponse<PageResponse<ProductOptionResponse>>>(
    '/product-options/page',
    {
      params: {
        pageNumber: zeroBasedPage,
        pageSize,
        ...(params.search?.trim() ? { search: params.search.trim() } : {})
      }
    }
  )

  const data = response.data.data
  let content = data.content || []

  if (params.search?.trim()) {
    const term = params.search.trim().toLowerCase()
    content = content.filter((a) => a.name.toLowerCase().includes(term))
  }

  if (params.sortField) {
    content = [...content].sort((a, b) => {
      const field = params.sortField as keyof ProductOptionResponse
      if (field === 'id') {
        const idA = Number(a.id) || 0
        const idB = Number(b.id) || 0
        return params.sortDir === 'desc' ? idB - idA : idA - idB
      }
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
 * Fetches a single product option by ID.
 */
export async function getOptionById(id: number | string): Promise<ProductOptionResponse> {
  const response = await apiClient.get<ApiResponse<ProductOptionResponse>>(`/product-options/${id}`)
  return response.data.data
}

/**
 * Creates a new product option (e.g. Color, Size).
 */
export async function createOption(payload: ProductOptionCreateRequest): Promise<void> {
  await apiClient.post<ApiResponse<void>>('/product-options', {
    name: payload.name.trim()
  })
}

/**
 * Updates an existing product option by ID.
 */
export async function updateOption(
  id: number | string,
  payload: ProductOptionUpdateRequest
): Promise<void> {
  await apiClient.put<ApiResponse<void>>(`/product-options/${id}`, {
    name: payload.name.trim()
  })
}

/**
 * Deletes a product option by ID.
 */
export async function deleteOption(id: number | string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/product-options/${id}`)
}

/**
 * Fetches all product options for selection dropdowns.
 */
export async function getAllOptions(): Promise<ProductOptionResponse[]> {
  try {
    const res = await getOptionsPage({ pageNumber: 0, pageSize: 1000 })
    return res.content || []
  } catch (err) {
    console.error('Failed to load all product options:', err)
    return []
  }
}

export const productOptionService = {
  getOptionsPage,
  getProductOptions,
  getOptionById,
  createOption,
  updateOption,
  deleteOption,
  getAllOptions
}

export default productOptionService
