import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query'
import {
  createOption,
  deleteOption,
  getAllOptions,
  getOptionById,
  getOptionsPage,
  updateOption
} from '~/shared/services/api/productOptionService'
import type {
  PageResponse,
  PaginationParams,
  ProductOptionCreateRequest,
  ProductOptionResponse,
  ProductOptionUpdateRequest
} from '~/shared/types'
import { showToast } from '~/shared/utils/toast'

/**
 * Query key factory for product options.
 */
export const optionKeys = {
  all: ['product-options'] as const,
  lists: () => [...optionKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { search?: string }) => [...optionKeys.lists(), params] as const,
  details: () => [...optionKeys.all, 'detail'] as const,
  detail: (id?: number | string) => [...optionKeys.details(), id] as const
}

/**
 * React Query hook for fetching a paginated list of product options.
 */
export function useProductOptionPageQuery(
  params: PaginationParams & { search?: string } = {},
  options?: Omit<UseQueryOptions<PageResponse<ProductOptionResponse>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PageResponse<ProductOptionResponse>, Error>({
    queryKey: optionKeys.list(params),
    queryFn: () => getOptionsPage(params),
    placeholderData: (previousData) => previousData,
    ...options
  })
}

/**
 * React Query hook for fetching all product options.
 */
export function useAllProductOptionsQuery(
  options?: Omit<UseQueryOptions<ProductOptionResponse[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProductOptionResponse[], Error>({
    queryKey: optionKeys.lists(),
    queryFn: () => getAllOptions(),
    ...options
  })
}

/**
 * React Query hook for fetching a single product option by ID.
 */
export function useProductOptionDetailQuery(
  id?: number | string,
  options?: Omit<UseQueryOptions<ProductOptionResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProductOptionResponse, Error>({
    queryKey: optionKeys.detail(id),
    queryFn: () => {
      if (!id) throw new Error('Option ID is required')
      return getOptionById(id)
    },
    enabled: Boolean(id),
    ...options
  })
}

/**
 * React Query hook for creating a product option.
 */
export function useCreateProductOptionMutation(
  options?: UseMutationOptions<void, Error, ProductOptionCreateRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (payload: ProductOptionCreateRequest) => createOption(payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: optionKeys.all })
      showToast('success', 'toasts.optionCreated')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Create option error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for updating a product option.
 */
export function useUpdateProductOptionMutation(
  options?: UseMutationOptions<void, Error, { id: number | string; payload: ProductOptionUpdateRequest }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: ({ id, payload }: { id: number | string; payload: ProductOptionUpdateRequest }) =>
      updateOption(id, payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: optionKeys.all })
      showToast('success', 'toasts.optionUpdated')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Update option error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for deleting a product option.
 */
export function useDeleteProductOptionMutation(
  options?: UseMutationOptions<void, Error, number | string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (id: number | string) => deleteOption(id),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: optionKeys.all })
      showToast('success', 'toasts.optionDeleted')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Delete option error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

export default useProductOptionPageQuery
