import type { PageResponse, SortDirection } from './pagination'

export interface ProductAttributeResponse {
  id: number
  name: string
  createdAt: string | null
  updatedAt: string | null
}

export interface ProductAttributeCreateRequest {
  name: string
}

export interface ProductAttributeUpdateRequest {
  name: string
}

export interface ProductAttributeItem {
  id: number | string
  name: string
  createdAt?: string | null
  updatedAt?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface GetProductAttributesParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedProductAttributesResponse = PageResponse<ProductAttributeResponse>

export type ProductAttributeSortField = 'id' | 'name' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt'
