import type { PageResponse, SortDirection } from './pagination'
import type { ProductAttributeItem, ProductAttributeResponse } from './productAttribute'

export interface ProductTemplateResponse {
  id: number
  name: string
  createdAt: string | null
  updatedAt: string | null
  attributes: ProductAttributeResponse[]
  attributeIds?: number[]
}

export interface ProductTemplateCreateRequest {
  name: string
  attributeIds?: number[]
}

export interface ProductTemplateUpdateRequest {
  name: string
  attributeIds?: number[]
}

export interface ProductAttributeTemplateItem {
  id: number | string
  name: string
  attributeIds?: number[]
  attributes?: (ProductAttributeItem | ProductAttributeResponse)[]
  createdAt?: string | null
  updatedAt?: string | null
}

export interface GetProductAttributeTemplatesParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
  isIncludeAttributes?: boolean
}

export type PaginatedProductAttributeTemplatesResponse = PageResponse<ProductTemplateResponse>

export type ProductAttributeTemplateSortField = 'id' | 'name' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt'
