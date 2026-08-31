import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import type { ErrorResponse } from '~/shared/types'
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

class AxiosClient {
  private instance: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
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
        const token = getAccessToken()
        if (token && config.headers) {
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
      (response: AxiosResponse) => {
        if (response.data && typeof response.data === 'object') {
          response.data = toCamelCase(response.data)
        }

        return response
      },
      async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

        // Handle 401 Unauthorized token refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          const url = originalRequest.url || ''
          // Avoid refreshing on sign-in or refresh endpoint itself
          if (url.includes('/auth/public/sign-in') || url.includes('/auth/public/refresh')) {
            return Promise.reject(error)
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
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
            const refreshResponse = await this.instance.post<{ status: string; data: string | { accessToken: string } }>(
              '/auth/public/refresh'
            )


            const data = refreshResponse.data?.data
            const newAccessToken = typeof data === 'string' ? data : data?.accessToken

            if (!newAccessToken) {
              throw new Error('No access token returned from refresh endpoint')
            }

            setAccessToken(newAccessToken)
            this.processQueue(null, newAccessToken)

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            }

            return this.instance(originalRequest)
          } catch (refreshError: any) {
            console.group('🔒 [Auth Refresh Error]')
            console.error('❌ Failed to refresh access token on 401 response')
            console.error('Request URL:', originalRequest.url)
            console.error('Refresh Error:', refreshError)
            if (axios.isAxiosError(refreshError)) {
              console.error('Refresh Response Status:', refreshError.response?.status)
              console.error('Refresh Response Data:', refreshError.response?.data)
              console.error('Refresh Request Headers:', refreshError.config?.headers)
            }
            console.groupEnd()

            this.processQueue(refreshError as Error, null)
            setAccessToken(null)

            // Properly clear Zustand auth store to avoid redirect loops between /login and /admin
            import('~/stores').then(({ useAuthStore }) => {
              useAuthStore.getState().logout()
            }).catch(() => {})

            this.handleUnauthorized(refreshError)
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private handleUnauthorized(error?: any): void {
    if (typeof window === 'undefined') return

    // Debug mode check: allow developers to prevent auto-redirect by running `localStorage.setItem('DEBUG_AUTH', 'true')` in Console
    const isDebugNoRedirect =
      localStorage.getItem('DEBUG_AUTH') === 'true' ||
      (window as any).__DISABLE_AUTH_REDIRECT__ === true ||
      import.meta.env.VITE_DISABLE_AUTH_REDIRECT === 'true'

    if (isDebugNoRedirect) {
      console.warn('⚠️ [Auth Debug] Auto-redirect to /login suppressed because DEBUG_AUTH is enabled.')
      return
    }

    // window.location.href = '/login'
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

