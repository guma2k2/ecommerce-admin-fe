import type { AxiosResponse } from 'axios'

export interface ApiResponse<T = unknown> {
  status: '200' | '204' | '400' | string
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
  data?: unknown
  errors?: Record<string, string[]>
}

export interface ApiErrorPayload {
  status: '400' | string
  message: string
  data: string
}

// Custom ApplicationError rejected by Axios interceptor for in-envelope and network errors
export class ApplicationError extends Error {
  public readonly status: string
  public readonly errorCode: string
  public readonly response?: AxiosResponse

  constructor(
    message: string,
    errorCode?: string,
    status: string = '400',
    response?: AxiosResponse
  ) {
    super(message)
    this.name = 'ApplicationError'
    this.status = status
    this.errorCode = errorCode || message
    this.response = response
    Object.setPrototypeOf(this, ApplicationError.prototype)
  }
}
