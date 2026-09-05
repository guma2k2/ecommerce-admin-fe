import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { ApplicationError, type ErrorResponse } from '~/shared/types'
import { toCamelCase, toSnakeCase } from '~/shared/utils/appUtils'
import StorageHelper from '~/shared/utils/storageHelper'

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
  if (token) {
    StorageHelper.setCookie('token', token)
  } else {
    StorageHelper.removeCookie('token')
  }
}

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = StorageHelper.getCookie('token') || null
  }
  return accessToken
}

/**
 * Interface for auth lifecycle callbacks to avoid dynamic imports and circular dependencies
 */
export interface AuthCallbacks {
  onUnauthorized?: () => void
  onTokenRefresh?: (token: string) => void
}

let authCallbacks: AuthCallbacks = {}

export const registerAuthCallbacks = (callbacks: AuthCallbacks) => {
  authCallbacks = { ...authCallbacks, ...callbacks }
}

class AxiosClient {
  private instance: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (token: string | null) => void
    reject: (reason?: unknown) => void
  }> = []

  constructor() {
    const baseURL = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:8080/api/v1'
    console.log('AxiosClient initialized with base URL:', baseURL)

    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      withCredentials: true // Required for HttpOnly refresh_token cookie
    })

    this.setupInterceptors()
  }

  private processQueue(error: Error | null, token: string | null = null): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve(token)
      }
    })
    this.failedQueue = []
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const url = config.url || ''
        const isPublicAuthRoute = url.includes('/auth/public/')
        const token = getAccessToken()

        // Do not attach expired token to public auth endpoints (e.g. /auth/public/refresh, /auth/public/sign-in)
        if (token && config.headers && !isPublicAuthRoute) {
          config.headers.Authorization = `Bearer ${token}`
        }

        if (config.data && !(config.data instanceof FormData)) {
          config.data = toSnakeCase(config.data)
        }

        if (config.params && typeof config.params === 'object') {
          config.params = toSnakeCase(config.params)
        }

        return config
      },
      (error: AxiosError) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      async (response: AxiosResponse) => {
        if (response.data && typeof response.data === 'object') {
          response.data = toCamelCase(response.data)
        }

        const resData = response.data
        const originalRequest = response.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

        // Check if the response matches an ApiResponse envelope
        if (resData && typeof resData === 'object' && 'status' in resData) {
          const statusStr = String(resData.status).trim()

          // In-Envelope Business Error (status === "400")
          if (statusStr === '400') {
            const errorCode = typeof resData.data === 'string' ? resData.data.trim() : 'bad_request'

            // Sub-case: Unauthenticated token expiration
            if (errorCode === 'unauthenticated' && originalRequest) {
              return this.handleUnauthenticatedRefresh(originalRequest, response)
            }

            // Sub-case: Unauthorized permission check
            if (errorCode === 'unauthorized') {
              console.warn('[Security] Access Denied: User lacks required permissions')
            }

            // When server responds with error status 400, use data (snake_case translation key) for showToast message
            const toastKey =
              typeof resData.data === 'string' && resData.data.trim()
                ? resData.data.trim()
                : (resData.message || 'toasts.error')

            // Overwrite message so callers accessing error?.response?.data?.message receive the snake_case key
            response.data.message = toastKey

            return Promise.reject(new ApplicationError(toastKey, errorCode, '400', response))
          }

          // Non-200/204 status error (e.g. 500)
          if (statusStr !== '200' && statusStr !== '204') {
            const toastKey =
              typeof resData.data === 'string' && resData.data.trim()
                ? resData.data.trim()
                : (resData.message || 'toasts.error')
            response.data.message = toastKey
            return Promise.reject(new ApplicationError(toastKey, toastKey, statusStr, response))
          }

          return response
        }

        return response
      },
      async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

        // Handle HTTP 401 Unauthorized status code
        if (error.response?.status === 401 && originalRequest) {
          return this.handleUnauthenticatedRefresh(originalRequest, error.response)
        }

        // Network-level failures (e.g. 502 Bad Gateway, Network Offline, or 500 status code)
        const toastKey =
          (typeof error.response?.data?.data === 'string' && error.response.data.data.trim()) ||
          error.message ||
          'toasts.error'
        const status = String(error.response?.status || '500')

        return Promise.reject(new ApplicationError(toastKey, toastKey, status, error.response))
      }
    )
  }

  private createApplicationError(response?: AxiosResponse): ApplicationError {
    const data = response?.data as Record<string, unknown> | undefined
    const toastKey =
      (typeof data?.data === 'string' && data.data.trim()) ||
      (typeof data?.message === 'string' && data.message.trim()) ||
      'toasts.error'
    const status = String(data?.status || response?.status || '400')

    return new ApplicationError(toastKey, toastKey, status, response)
  }

  private async handleUnauthenticatedRefresh(
    originalRequest: InternalAxiosRequestConfig & { _retry?: boolean },
    triggerResponse?: AxiosResponse
  ): Promise<AxiosResponse> {
    const url = originalRequest.url || ''
    const isAuthUrl =
      url.includes('/auth/public/sign-in') ||
      url.includes('/auth/public/refresh') ||
      url.includes('/auth/sign-out')

    // Avoid refreshing on sign-in, refresh endpoint, or sign-out itself
    if (isAuthUrl) {
      if (url.includes('/auth/public/refresh')) {
        // Refresh token itself failed/expired: clear session and trigger logout callback
        setAccessToken(null)
        authCallbacks.onUnauthorized?.()
      }
      return Promise.reject(this.createApplicationError(triggerResponse))
    }

    if (originalRequest._retry) {
      return Promise.reject(this.createApplicationError(triggerResponse))
    }

    if (this.isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        this.failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return this.instance(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    this.isRefreshing = true

    try {
      // Call refresh endpoint with credentials (cookie sent automatically)
      const refreshResponse = await this.instance.post<{
        status: string
        message?: string
        data: string | { accessToken?: string }
      }>('/auth/public/refresh')

      const resData = refreshResponse.data
      const rawData = resData?.data
      const newAccessToken = typeof rawData === 'string' ? rawData : rawData?.accessToken

      if (
        String(resData?.status) !== '200' ||
        !newAccessToken ||
        newAccessToken === 'invalid_token' ||
        newAccessToken === 'unauthenticated'
      ) {
        throw new Error(resData?.message || 'No access token returned from refresh endpoint')
      }

      setAccessToken(newAccessToken)
      authCallbacks.onTokenRefresh?.(newAccessToken)

      this.processQueue(null, newAccessToken)

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      }

      return this.instance(originalRequest)
    } catch (refreshError: unknown) {
      const err = refreshError instanceof Error ? refreshError : new Error(String(refreshError))
      this.processQueue(err, null)
      setAccessToken(null)
      authCallbacks.onUnauthorized?.()

      this.handleUnauthorized(err)
      return Promise.reject(err)
    } finally {
      this.isRefreshing = false
    }
  }

  private handleUnauthorized(error?: unknown): void {
    if (typeof window === 'undefined') return
    // AuthenticateLayout automatically redirects when useAuthStore isAuthenticated becomes false
  }

  // Set authorization token
  public setToken(token: string): void {
    setAccessToken(token)
  }

  // Remove authorization token
  public removeToken(): void {
    setAccessToken(null)
  }

  // Get axios instance for usage
  public getInstance(): AxiosInstance {
    return this.instance
  }
}

// Create and export singleton instance
const axiosClientInstance = new AxiosClient()
export const apiClient = axiosClientInstance.getInstance()

// Export the axios instance directly as default
export default apiClient

// Export utility methods
export const setToken = (token: string) => axiosClientInstance.setToken(token)
export const removeToken = () => axiosClientInstance.removeToken()
