import type { PageResponse, SortDirection } from './pagination'

export interface CategoryItem {
  id: string
  name: string
  parentId?: string | null
  parent?: {
    id: string
    name: string
  } | null
  created_at: string
  updated_at: string
}

export interface CategoryInput {
  name: string
  parentId?: string | null
}

export interface GetCategoriesParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedCategoriesResponse = PageResponse<CategoryItem>

export type CategorySortField = 'id' | 'name' | 'parent' | 'created_at' | 'updated_at'
export type SortField = CategorySortField
