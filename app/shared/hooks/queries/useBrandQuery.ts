import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query'
import {
  createBrand,
  deleteBrand,
  getBrandById,
  getBrandsPage,
  updateBrand
} from '~/shared/services/api/brandService'
import type {
  BrandCreateRequest,
  BrandResponse,
  BrandUpdateRequest,
  PageResponse,
  PaginationParams
} from '~/shared/types'
import { showToast } from '~/shared/utils/toast'

/**
 * Query key factory for brand cache management.
 */
export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { search?: string }) => [...brandKeys.lists(), params] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (id?: number | string) => [...brandKeys.details(), id] as const
}

/**
 * React Query hook for fetching a paginated list of brands.
 */
export function useBrandPageQuery(
  params: PaginationParams & { search?: string } = {},
  options?: Omit<UseQueryOptions<PageResponse<BrandResponse>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PageResponse<BrandResponse>, Error>({
    queryKey: brandKeys.list(params),
    queryFn: () => getBrandsPage(params),
    placeholderData: (previousData) => previousData,
    ...options
  })
}

/**
 * React Query hook for fetching a single brand's details by ID.
 */
export function useBrandDetailQuery(
  brandId?: number | string,
  options?: Omit<UseQueryOptions<BrandResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<BrandResponse, Error>({
    queryKey: brandKeys.detail(brandId),
    queryFn: () => {
      if (!brandId) throw new Error('Brand ID is required')
      return getBrandById(brandId)
    },
    enabled: Boolean(brandId),
    ...options
  })
}

/**
 * React Query hook for creating a new brand.
 */
export function useCreateBrandMutation(
  options?: UseMutationOptions<void, Error, BrandCreateRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (payload: BrandCreateRequest) => createBrand(payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
      showToast('success', 'toasts.brandCreated')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Create brand error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for updating an existing brand.
 */
export function useUpdateBrandMutation(
  options?: UseMutationOptions<void, Error, { id: number | string; payload: BrandUpdateRequest }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: ({ id, payload }: { id: number | string; payload: BrandUpdateRequest }) =>
      updateBrand(id, payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all })
      showToast('success', 'toasts.brandUpdated')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Update brand error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for deleting a brand.
 */
export function useDeleteBrandMutation(
  options?: UseMutationOptions<void, Error, number | string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (brandId: number | string) => deleteBrand(brandId),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all })
      showToast('success', 'toasts.brandDeleted')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Delete brand error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

export default useBrandPageQuery
