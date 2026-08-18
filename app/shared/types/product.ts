import type { PageResponse, SortDirection } from './pagination'
import type { ProductVariant } from './ProductVariant'

export interface ProductItem {
  id: string
  name: string
  image: string
  created_at: string
  updated_at: string
}

export interface GetProductsParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedProductsResponse = PageResponse<ProductItem>

export type { ProductVariant }
