import apiClient from '~/shared/services/axiosClient'
import type {
  ApiResponse,
  GetProductAttributeTemplatesParams,
  PageResponse,
  PaginationParams,
  PaginatedProductAttributeTemplatesResponse,
  ProductAttributeResponse,
  ProductAttributeTemplateItem,
  ProductTemplateCreateRequest,
  ProductTemplateResponse,
  ProductTemplateUpdateRequest
} from '~/shared/types'
import { getAllProductAttributes } from './productAttributeService'

export type {
  GetProductAttributeTemplatesParams,
  PaginatedProductAttributeTemplatesResponse,
  ProductAttributeTemplateItem,
  ProductTemplateCreateRequest,
  ProductTemplateResponse,
  ProductTemplateUpdateRequest
}

/**
 * Enriches a template with its referenced ProductAttribute objects.
 */
export function populateTemplateAttributes(
  template: ProductTemplateResponse,
  allAttributes: ProductAttributeResponse[]
): ProductAttributeTemplateItem {
  const attrMap = new Map(allAttributes.map((a) => [Number(a.id), a]))
  const attributes = (template.attributeIds || [])
    .map((id) => attrMap.get(Number(id)))
    .filter(Boolean) as ProductAttributeResponse[]

  return {
    ...template,
    attributeIds: template.attributeIds ? template.attributeIds.map(Number) : [],
    attributes,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt
  }
}

/**
 * Fetches a paginated list of product templates (0-based pageNumber).
 */
export async function getTemplatesPage(
  params: PaginationParams & { search?: string } = {}
): Promise<PageResponse<ProductTemplateResponse>> {
  const pageNumber = params.pageNumber !== undefined ? Math.max(0, params.pageNumber) : 0
  const pageSize = params.pageSize ?? 10

  const response = await apiClient.get<ApiResponse<PageResponse<ProductTemplateResponse>>>(
    '/product-templates/page',
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
export async function getProductAttributeTemplates(
  params: GetProductAttributeTemplatesParams = {}
): Promise<PageResponse<ProductAttributeTemplateItem>> {
  const uiPageNumber = params.pageNumber ?? 1
  const zeroBasedPage = Math.max(0, uiPageNumber - 1)
  const pageSize = params.pageSize ?? 10

  const [response, allAttributes] = await Promise.all([
    apiClient.get<ApiResponse<PageResponse<ProductTemplateResponse>>>('/product-templates/page', {
      params: {
        pageNumber: zeroBasedPage,
        pageSize,
        ...(params.search?.trim() ? { search: params.search.trim() } : {})
      }
    }),
    getAllProductAttributes()
  ])

  const data = response.data.data
  const rawContent = data.content || []
  let content = rawContent.map((t) => populateTemplateAttributes(t, allAttributes))

  if (params.search?.trim()) {
    const term = params.search.trim().toLowerCase()
    content = content.filter((t) => t.name.toLowerCase().includes(term))
  }

  if (params.sortField) {
    content = [...content].sort((a, b) => {
      const field = params.sortField as keyof ProductAttributeTemplateItem
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
 * Fetches a single product template by ID with its attributeIds list.
 */
export async function getTemplateById(
  id: number | string
): Promise<ProductTemplateResponse> {
  const response = await apiClient.get<ApiResponse<ProductTemplateResponse>>(`/product-templates/${id}`)
  return response.data.data
}

/**
 * Fetches a single product template by ID with enriched attribute objects.
 */
export async function getProductAttributeTemplateById(
  id: number | string
): Promise<ProductAttributeTemplateItem> {
  const [template, allAttributes] = await Promise.all([
    getTemplateById(id),
    getAllProductAttributes()
  ])

  return populateTemplateAttributes(template, allAttributes)
}

/**
 * Creates a new product template with ordered attribute IDs.
 */
export async function createProductAttributeTemplate(
  payload:
    | ProductTemplateCreateRequest
    | { name: string; attribute_ids?: (number | string)[]; attributeIds?: number[] }
): Promise<void> {
  let attributeIds: number[] = []

  if (payload.attributeIds && Array.isArray(payload.attributeIds)) {
    attributeIds = payload.attributeIds.map(Number).filter((n) => !isNaN(n))
  } else if ('attribute_ids' in payload && payload.attribute_ids && Array.isArray(payload.attribute_ids)) {
    attributeIds = payload.attribute_ids.map(Number).filter((n) => !isNaN(n))
  }

  await apiClient.post<ApiResponse<void>>('/product-templates', {
    name: payload.name.trim(),
    attributeIds
  })
}

export const createTemplate = createProductAttributeTemplate

/**
 * Updates an existing product template by ID.
 */
export async function updateProductAttributeTemplate(
  id: number | string,
  payload:
    | ProductTemplateUpdateRequest
    | { name: string; attribute_ids?: (number | string)[]; attributeIds?: number[] }
): Promise<void> {
  let attributeIds: number[] = []

  if (payload.attributeIds && Array.isArray(payload.attributeIds)) {
    attributeIds = payload.attributeIds.map(Number).filter((n) => !isNaN(n))
  } else if ('attribute_ids' in payload && payload.attribute_ids && Array.isArray(payload.attribute_ids)) {
    attributeIds = payload.attribute_ids.map(Number).filter((n) => !isNaN(n))
  }

  await apiClient.put<ApiResponse<void>>(`/product-templates/${id}`, {
    name: payload.name.trim(),
    attributeIds
  })
}

export const updateTemplate = updateProductAttributeTemplate

/**
 * Deletes a product template by ID.
 */
export async function deleteProductAttributeTemplate(id: number | string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/product-templates/${id}`)
}

export const deleteTemplate = deleteProductAttributeTemplate

/**
 * Fetches all product templates for product form selection.
 */
export async function getAllProductAttributeTemplates(): Promise<ProductAttributeTemplateItem[]> {
  try {
    const [res, allAttributes] = await Promise.all([
      getTemplatesPage({ pageNumber: 0, pageSize: 1000 }),
      getAllProductAttributes()
    ])
    return (res.content || []).map((t) => populateTemplateAttributes(t, allAttributes))
  } catch (err) {
    console.error('Failed to load all product templates:', err)
    return []
  }
}

export const productTemplateService = {
  getTemplatesPage,
  getProductAttributeTemplates,
  getTemplateById,
  getProductAttributeTemplateById,
  createProductAttributeTemplate,
  createTemplate,
  updateProductAttributeTemplate,
  updateTemplate,
  deleteProductAttributeTemplate,
  deleteTemplate,
  getAllProductAttributeTemplates,
  populateTemplateAttributes
}

export default productTemplateService
