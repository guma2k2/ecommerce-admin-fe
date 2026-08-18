import type { PageResponse, SortDirection } from './pagination'

export interface BrandItem {
  id: string
  name: string
  image: string
  created_at: string
  updated_at: string
}

export interface GetBrandsParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedBrandsResponse = PageResponse<BrandItem>

export type BrandSortField = 'name' | 'created_at' | 'updated_at'
