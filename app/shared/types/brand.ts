import type { PageResponse, SortDirection } from './pagination'

export interface BrandResponse {
  id: number
  name: string
  description: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface BrandCreateRequest {
  name: string
  description?: string | null
}

export interface BrandUpdateRequest {
  name: string
  description?: string | null
}

export interface BrandItem {
  id: number | string
  name: string
  description?: string | null
  image?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface GetBrandsParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedBrandsResponse = PageResponse<BrandResponse>

export type BrandSortField = 'name' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt' | 'id'
