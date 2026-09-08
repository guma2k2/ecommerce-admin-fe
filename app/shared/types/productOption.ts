import type { PageResponse, SortDirection } from './pagination'

export interface ProductOptionResponse {
  id: number
  name: string
}

export interface ProductOptionCreateRequest {
  name: string
}

export interface ProductOptionUpdateRequest {
  id?: number
  name: string
}

export interface ProductOptionItem {
  id: number | string
  name: string
  createdAt?: string | null
  updatedAt?: string | null
}

export interface GetProductOptionsParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedProductOptionsResponse = PageResponse<ProductOptionResponse>

export type ProductOptionSortField = 'id' | 'name'
