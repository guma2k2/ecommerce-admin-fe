import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query'
import {
  createProductAttributeTemplate,
  deleteProductAttributeTemplate,
  getAllProductAttributeTemplates,
  getProductAttributeTemplateById,
  getTemplatesPage,
  updateProductAttributeTemplate
} from '~/shared/services/api/productAttributeTemplateService'
import type {
  PageResponse,
  PaginationParams,
  ProductAttributeTemplateItem,
  ProductTemplateCreateRequest,
  ProductTemplateResponse,
  ProductTemplateUpdateRequest
} from '~/shared/types'
import { showToast } from '~/shared/utils/toast'

/**
 * Query key factory for product templates (attribute templates).
 */
export const templateKeys = {
  all: ['product-templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { search?: string }) => [...templateKeys.lists(), params] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id?: number | string) => [...templateKeys.details(), id] as const
}

/**
 * React Query hook for fetching a paginated list of product templates.
 */
export function useProductTemplatePageQuery(
  params: PaginationParams & { search?: string } = {},
  options?: Omit<UseQueryOptions<PageResponse<ProductTemplateResponse>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PageResponse<ProductTemplateResponse>, Error>({
    queryKey: templateKeys.list(params),
    queryFn: () => getTemplatesPage(params),
    placeholderData: (previousData) => previousData,
    ...options
  })
}

/**
 * React Query hook for fetching all product templates enriched with attribute items.
 */
export function useAllProductTemplatesQuery(
  options?: Omit<UseQueryOptions<ProductAttributeTemplateItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProductAttributeTemplateItem[], Error>({
    queryKey: templateKeys.lists(),
    queryFn: () => getAllProductAttributeTemplates(),
    ...options
  })
}

/**
 * React Query hook for fetching a single product template by ID.
 */
export function useProductTemplateDetailQuery(
  id?: number | string,
  options?: Omit<UseQueryOptions<ProductAttributeTemplateItem, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ProductAttributeTemplateItem, Error>({
    queryKey: templateKeys.detail(id),
    queryFn: () => {
      if (!id) throw new Error('Template ID is required')
      return getProductAttributeTemplateById(id)
    },
    enabled: Boolean(id),
    ...options
  })
}

/**
 * React Query hook for creating a product template.
 */
export function useCreateProductTemplateMutation(
  options?: UseMutationOptions<void, Error, ProductTemplateCreateRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (payload) => createProductAttributeTemplate(payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Create template error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for updating a product template.
 */
export function useUpdateProductTemplateMutation(
  options?: UseMutationOptions<
    void,
    Error,
    { id: number | string; payload: ProductTemplateUpdateRequest }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: ({ id, payload }) => updateProductAttributeTemplate(id, payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Update template error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for deleting a product template.
 */
export function useDeleteProductTemplateMutation(
  options?: UseMutationOptions<void, Error, number | string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (id: number | string) => deleteProductAttributeTemplate(id),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Delete template error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

export default useProductTemplatePageQuery
