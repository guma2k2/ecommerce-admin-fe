export interface ApiResponse<T = any> {
  status: string
  data: T
  message?: string
  errors?: Record<string, string[]>
  meta?: {
    totalElements?: number
    pageNumber?: number
    pageSize?: number
    totalPages?: number
  }
}

export interface ErrorResponse {
  status: string
  message: string
  errors?: Record<string, string[]>
}
