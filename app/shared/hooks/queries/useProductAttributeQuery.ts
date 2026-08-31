import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query'
import {
  createProductAttribute,
  deleteProductAttribute,
  getAllProductAttributes,
  getProductAttributeById,
  getAttributesPage,
  updateProductAttribute
} from '~/shared/services/api/productAttributeService'
import type {
  PageResponse,
  PaginationParams,
  ProductAttributeCreateRequest,
  ProductAttributeResponse,
  ProductAttributeUpdateRequest
} from '~/shared/types'
import { showToast } from '~/shared/utils/toast'

/**
 * Query key factory for product attributes.
 */
export const attributeKeys = {
  all: ['product-attributes'] as const,
  lists: () => [...attributeKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { search?: string }) => [...attributeKeys.lists(), params] as const,
  details: () => [...attributeKeys.all, 'detail'] as const,
  detail: (id?: number | string) => [...attributeKeys.details(), id] as const
}

/**
 * React Query hook for fetching a paginated list of product attributes.
 */
export function useProductAttributePageQuery(
  params: PaginationParams & { search?: string } = {},
  options?: Omit<UseQueryOptions<PageResponse<ProductAttributeResponse>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PageResponse<ProductAttributeResponse>, Error>({
    queryKey: attributeKeys.list(params),
    queryFn: () => getAttributesPage(params),
    placeholderData: (previousData) => previousData,
    ...options
  })
}

/**
 * React Query hook for fetching all product attributes.
 */
export function useAllProductAttributesQuery(
  options?: Omit<UseQueryOptions<ProductAttributeResponse[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProductAttributeResponse[], Error>({
    queryKey: attributeKeys.lists(),
    queryFn: () => getAllProductAttributes(),
    ...options
  })
}

/**
 * React Query hook for fetching a single product attribute by ID.
 */
export function useProductAttributeDetailQuery(
  id?: number | string,
  options?: Omit<UseQueryOptions<ProductAttributeResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProductAttributeResponse, Error>({
    queryKey: attributeKeys.detail(id),
    queryFn: () => {
      if (!id) throw new Error('Attribute ID is required')
      return getProductAttributeById(id)
    },
    enabled: Boolean(id),
    ...options
  })
}

/**
 * React Query hook for creating a product attribute.
 */
export function useCreateProductAttributeMutation(
  options?: UseMutationOptions<void, Error, ProductAttributeCreateRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (payload: ProductAttributeCreateRequest) => createProductAttribute(payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all })
      showToast('success', 'toasts.attributeCreated')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Create attribute error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for updating a product attribute.
 */
export function useUpdateProductAttributeMutation(
  options?: UseMutationOptions<void, Error, { id: number | string; payload: ProductAttributeUpdateRequest }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: ({ id, payload }: { id: number | string; payload: ProductAttributeUpdateRequest }) =>
      updateProductAttribute(id, payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all })
      showToast('success', 'toasts.attributeUpdated')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Update attribute error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for deleting a product attribute.
 */
export function useDeleteProductAttributeMutation(
  options?: UseMutationOptions<void, Error, number | string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (id: number | string) => deleteProductAttribute(id),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all })
      showToast('success', 'toasts.attributeDeleted')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Delete attribute error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

export default useProductAttributePageQuery
