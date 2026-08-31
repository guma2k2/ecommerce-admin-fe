import type { PageResponse, SortDirection } from './pagination'
import type { ProductAttributeItem, ProductAttributeResponse } from './productAttribute'

export interface ProductTemplateResponse {
  id: number
  name: string
  createdAt: string | null
  updatedAt: string | null
  attributeIds: number[]
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
  attribute_ids?: (number | string)[]
  attributes?: (ProductAttributeItem | ProductAttributeResponse)[]
  createdAt?: string | null
  updatedAt?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface GetProductAttributeTemplatesParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedProductAttributeTemplatesResponse = PageResponse<ProductTemplateResponse>

export type ProductAttributeTemplateSortField = 'id' | 'name' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt'
