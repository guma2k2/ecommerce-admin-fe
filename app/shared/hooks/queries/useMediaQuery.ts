import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query'
import {
  getMediaById,
  getMediaPage,
  uploadMedia
} from '~/shared/services/api/mediaService'
import type {
  GetMediaParams,
  MediaResponse,
  PageResponse,
  UploadMediaPayload
} from '~/shared/types'
import { showToast } from '~/shared/utils/toast'

/**
 * Query key factory for media cache management.
 */
export const mediaKeys = {
  all: ['medias'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  list: (params?: GetMediaParams) => [...mediaKeys.lists(), params] as const,
  details: () => [...mediaKeys.all, 'detail'] as const,
  detail: (id?: string) => [...mediaKeys.details(), id] as const
}

/**
 * React Query hook for fetching a paginated list of media files.
 */
export function useMediaPage(
  params: GetMediaParams = {},
  options?: Omit<UseQueryOptions<PageResponse<MediaResponse>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PageResponse<MediaResponse>, Error>({
    queryKey: mediaKeys.list(params),
    queryFn: () => getMediaPage(params),
    placeholderData: (previousData) => previousData,
    ...options
  })
}

/**
 * React Query hook for fetching a single media record by ID.
 */
export function useMediaDetail(
  mediaId?: string,
  options?: Omit<UseQueryOptions<MediaResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<MediaResponse, Error>({
    queryKey: mediaKeys.detail(mediaId),
    queryFn: () => {
      if (!mediaId) throw new Error('Media ID is required')
      return getMediaById(mediaId)
    },
    enabled: Boolean(mediaId),
    ...options
  })
}

/**
 * React Query hook for uploading media files (images or videos).
 * Automatically invalidates media lists upon successful upload.
 */
export function useUploadMedia(
  options?: UseMutationOptions<MediaResponse, Error, UploadMediaPayload>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (payload: UploadMediaPayload) => uploadMedia(payload),
    onSuccess: (data, variables, context, ...rest) => {
      // Invalidate media lists cache so views update immediately
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() })
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error, variables, context, ...rest) => {
      console.error('Upload media error:', error)
      showToast('error', error.message || 'toasts.uploadFailed')
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

export default useMediaPage

