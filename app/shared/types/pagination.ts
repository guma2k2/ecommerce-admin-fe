export type SortDirection = 'asc' | 'desc'
export type sortDirection = SortDirection

export interface PaginationParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
}

export interface PageResponse<T> {
  pageNumber: number
  pageSize: number
  totalPages: number
  totalElements: number
  content: T[]
}
