import type { PageResponse, SortDirection } from './pagination'

export interface CategoryResponse {
  id: number
  name: string
  children?: CategoryResponse[]
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CategoryCreateRequest {
  name: string
  parentId?: number | null
}

export interface CategoryUpdateRequest {
  name: string
  parentId?: number | null
}

export interface CategoryItem {
  id: number | string
  name: string
  parentId?: number | string | null
  parent?: {
    id: number | string
    name: string
  } | null
  children?: CategoryResponse[]
  createdAt?: string | null
  updatedAt?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CategoryInput {
  name: string
  parentId?: number | string | null
}

export interface GetCategoriesParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedCategoriesResponse = PageResponse<CategoryResponse>

export type CategorySortField = 'id' | 'name' | 'parent' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt'
export type SortField = CategorySortField
