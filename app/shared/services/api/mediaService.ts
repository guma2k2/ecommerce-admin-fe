import type { AxiosProgressEvent } from 'axios'
import apiClient from '~/shared/services/axiosClient'
import type {
  ApiResponse,
  GetMediaParams,
  GetMediaResponse,
  MediaItem,
  MediaResponse,
  PageResponse,
  UploadMediaPayload
} from '~/shared/types'

export type { GetMediaParams, GetMediaResponse, MediaItem, MediaResponse, UploadMediaPayload }

/**
 * Uploads an image or video file to backend media service.
 * Media type is automatically detected by the backend.
 */
export async function uploadMedia(
  fileOrPayload: File | UploadMediaPayload,
  altTextParam?: string,
  onUploadProgressParam?: (progressEvent: AxiosProgressEvent) => void
): Promise<MediaResponse> {
  let file: File
  let altText: string | undefined
  let onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined

  if (fileOrPayload instanceof File) {
    file = fileOrPayload
    altText = altTextParam
    onUploadProgress = onUploadProgressParam
  } else {
    file = fileOrPayload.file
    altText = fileOrPayload.altText
    onUploadProgress = fileOrPayload.onUploadProgress
  }

  const formData = new FormData()
  formData.append('file', file)

  if (altText && altText.trim().length > 0) {
    formData.append('altText', altText.trim())
  }

  const response = await apiClient.post<ApiResponse<MediaResponse>>('/medias', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress
  })

  return response.data.data
}

/**
 * Fetches paginated list of uploaded media records.
 * Supports zero-based page indexing as per backend specification.
 */
export async function getMediaPage(
  params: GetMediaParams = {}
): Promise<PageResponse<MediaResponse>> {
  const { pageNumber = 0, pageSize = 10 } = params

  const response = await apiClient.get<ApiResponse<PageResponse<MediaResponse>>>('/medias/page', {
    params: {
      pageNumber,
      pageSize
    }
  })

  return response.data.data
}

/**
 * Fetches a single media record by UUID.
 */
export async function getMediaById(mediaId: string): Promise<MediaResponse> {
  const response = await apiClient.get<ApiResponse<MediaResponse>>(`/medias/${mediaId}`)
  return response.data.data
}

// Aliases for compatibility
export const getMediaList = async (params: GetMediaParams): Promise<GetMediaResponse> => {
  // Convert 1-based pageNumber to 0-based if needed
  const pageNumber = params.pageNumber !== undefined ? Math.max(0, params.pageNumber - 1) : 0
  return getMediaPage({ ...params, pageNumber })
}

export const createMediaItem = async (file: File, customName?: string): Promise<MediaResponse> => {
  return uploadMedia(file, customName)
}

export const mediaApi = {
  uploadMedia,
  getMediaPage,
  getMediaById,
  getMediaList,
  createMediaItem
}

