import apiClient from '~/shared/services/axiosClient'
import type {
  ApiResponse,
  GetProductAttributesParams,
  PageResponse,
  PaginationParams,
  PaginatedProductAttributesResponse,
  ProductAttributeCreateRequest,
  ProductAttributeItem,
  ProductAttributeResponse,
  ProductAttributeUpdateRequest
} from '~/shared/types'

export type {
  GetProductAttributesParams,
  PaginatedProductAttributesResponse,
  ProductAttributeCreateRequest,
  ProductAttributeItem,
  ProductAttributeResponse,
  ProductAttributeUpdateRequest
}

/**
 * Fetches a paginated list of product attributes (0-based pageNumber).
 */
export async function getAttributesPage(
  params: PaginationParams & { search?: string } = {}
): Promise<PageResponse<ProductAttributeResponse>> {
  const pageNumber = params.pageNumber !== undefined ? Math.max(0, params.pageNumber) : 0
  const pageSize = params.pageSize ?? 10

  const response = await apiClient.get<ApiResponse<PageResponse<ProductAttributeResponse>>>(
    '/product-attributes/page',
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
export async function getProductAttributes(
  params: GetProductAttributesParams = {}
): Promise<PageResponse<ProductAttributeResponse>> {
  const uiPageNumber = params.pageNumber ?? 1
  const zeroBasedPage = Math.max(0, uiPageNumber - 1)
  const pageSize = params.pageSize ?? 10

  const response = await apiClient.get<ApiResponse<PageResponse<ProductAttributeResponse>>>(
    '/product-attributes/page',
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
      const field = params.sortField as keyof ProductAttributeResponse
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
 * Fetches a single product attribute by ID.
 */
export async function getProductAttributeById(
  id: number | string
): Promise<ProductAttributeResponse> {
  const response = await apiClient.get<ApiResponse<ProductAttributeResponse>>(`/product-attributes/${id}`)
  return response.data.data
}

export const getAttributeById = getProductAttributeById

/**
 * Creates a new product attribute.
 */
export async function createProductAttribute(
  payload: ProductAttributeCreateRequest | { name: string }
): Promise<void> {
  await apiClient.post<ApiResponse<void>>('/product-attributes', {
    name: payload.name.trim()
  })
}

export const createAttribute = createProductAttribute

/**
 * Updates an existing product attribute by ID.
 */
export async function updateProductAttribute(
  id: number | string,
  payload: ProductAttributeUpdateRequest | { name: string }
): Promise<void> {
  await apiClient.put<ApiResponse<void>>(`/product-attributes/${id}`, {
    name: payload.name.trim()
  })
}

export const updateAttribute = updateProductAttribute

/**
 * Deletes a product attribute by ID.
 */
export async function deleteProductAttribute(id: number | string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/product-attributes/${id}`)
}

export const deleteAttribute = deleteProductAttribute

/**
 * Fetches all product attributes for selection dropdowns and template associations.
 */
export async function getAllProductAttributes(): Promise<ProductAttributeResponse[]> {
  try {
    const res = await getAttributesPage({ pageNumber: 0, pageSize: 1000 })
    return res.content || []
  } catch (err) {
    console.error('Failed to load all product attributes:', err)
    return []
  }
}

export const productAttributeService = {
  getAttributesPage,
  getProductAttributes,
  getProductAttributeById,
  getAttributeById,
  createProductAttribute,
  createAttribute,
  updateProductAttribute,
  updateAttribute,
  deleteProductAttribute,
  deleteAttribute,
  getAllProductAttributes
}

export default productAttributeService
