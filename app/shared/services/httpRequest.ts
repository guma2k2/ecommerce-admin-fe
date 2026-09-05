import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import axiosClient from '~/shared/services/axiosClient'
import { showToast } from '~/shared/utils/toast'
import type { ApiResponse } from '~/shared/types'

class HttpRequest {
  // GET method
  // config: params, headers, responseType etc.
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await axiosClient.get<T>(url, config)
  }

  // POST method
  async post<T = unknown>(
    url: string,
    data?: unknown,
    isShowToast: boolean = true,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const response = await axiosClient.post<T>(url, data, config)
    if (isShowToast) {
      showToast('success', "toasts.createdSuccess")
    }
    return response
  }

  // PUT method
  async put<T = unknown>(
    url: string,
    data?: unknown,
    isShowToast: boolean = true,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const response = await axiosClient.put<T>(url, data, config)
    if (isShowToast) {
      showToast('success', "toasts.updatedSuccess")
    }
    return response
  }

  // PATCH method
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    isShowToast: boolean = true,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const response = await axiosClient.patch<T>(url, data, config)
    if (isShowToast) {
      showToast('success', "toasts.updatedSuccess")
    }
    return response
  }

  // DELETE method
  async delete<T = unknown>(
    url: string,
    data?: unknown,
    isShowToast: boolean = true,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      data
    }
    const response = await axiosClient.delete<T>(url, mergedConfig)
    if (isShowToast) {
      showToast('success', "toasts.deletedSuccess")
    }
    return response
  }

  // UPLOAD method
  async upload<T = unknown>(
    url: string,
    data: FormData,
    successMessage?: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const response = await axiosClient.post<T>(url, data, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    })

    if (successMessage) {
      showToast('success', successMessage)
    }

    return response
  }
}

// Create and export singleton instance
const httpRequest = new HttpRequest()
export default httpRequest

// Export for direct usage
export { httpRequest }

// Export types
export type { ApiResponse }
