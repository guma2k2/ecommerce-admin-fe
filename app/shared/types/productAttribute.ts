import type { PageResponse, SortDirection } from './pagination'

export interface ProductAttributeItem {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface GetProductAttributesParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedProductAttributesResponse = PageResponse<ProductAttributeItem>

export type ProductAttributeSortField = 'id' | 'name' | 'created_at' | 'updated_at'
