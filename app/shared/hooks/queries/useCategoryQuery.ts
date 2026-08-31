import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query'
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  getCategoriesPage,
  updateCategory
} from '~/shared/services/api/categoryService'
import type {
  CategoryCreateRequest,
  CategoryItem,
  CategoryResponse,
  CategoryUpdateRequest,
  PageResponse,
  PaginationParams
} from '~/shared/types'
import { showToast } from '~/shared/utils/toast'

/**
 * Query key factory for category cache management.
 */
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { search?: string }) => [...categoryKeys.lists(), params] as const,
  trees: () => [...categoryKeys.all, 'tree'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id?: number | string) => [...categoryKeys.details(), id] as const
}

/**
 * React Query hook for fetching a paginated list of categories.
 */
export function useCategoryPageQuery(
  params: PaginationParams & { search?: string } = {},
  options?: Omit<UseQueryOptions<PageResponse<CategoryResponse>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PageResponse<CategoryResponse>, Error>({
    queryKey: categoryKeys.list(params),
    queryFn: () => getCategoriesPage(params),
    placeholderData: (previousData) => previousData,
    ...options
  })
}

/**
 * React Query hook for fetching all categories flattened for selectors.
 */
export function useAllCategoriesQuery(
  options?: Omit<UseQueryOptions<CategoryItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CategoryItem[], Error>({
    queryKey: categoryKeys.trees(),
    queryFn: () => getAllCategories(),
    ...options
  })
}

/**
 * React Query hook for fetching a single category's details by ID (including children hierarchy).
 */
export function useCategoryDetailQuery(
  categoryId?: number | string,
  options?: Omit<UseQueryOptions<CategoryResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CategoryResponse, Error>({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => {
      if (!categoryId) throw new Error('Category ID is required')
      return getCategoryById(categoryId)
    },
    enabled: Boolean(categoryId),
    ...options
  })
}

/**
 * React Query hook for creating a new category.
 */
export function useCreateCategoryMutation(
  options?: UseMutationOptions<void, Error, CategoryCreateRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (payload: CategoryCreateRequest) => createCategory(payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      showToast('success', 'toasts.categoryCreated')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Create category error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for updating an existing category.
 */
export function useUpdateCategoryMutation(
  options?: UseMutationOptions<void, Error, { id: number | string; payload: CategoryUpdateRequest }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: ({ id, payload }: { id: number | string; payload: CategoryUpdateRequest }) =>
      updateCategory(id, payload),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      showToast('success', 'toasts.categoryUpdated')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Update category error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

/**
 * React Query hook for deleting a category.
 */
export function useDeleteCategoryMutation(
  options?: UseMutationOptions<void, Error, number | string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    ...options,
    mutationFn: (categoryId: number | string) => deleteCategory(categoryId),
    onSuccess: (data, variables, context, ...rest) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      showToast('success', 'toasts.categoryDeleted')
      if (options?.onSuccess) {
        ;(options.onSuccess as any)(data, variables, context, ...rest)
      }
    },
    onError: (error: any, variables, context, ...rest) => {
      console.error('Delete category error:', error)
      const errorMsg = error?.response?.data?.message || error?.message || 'toasts.error'
      showToast('error', errorMsg)
      if (options?.onError) {
        ;(options.onError as any)(error, variables, context, ...rest)
      }
    }
  })
}

export default useCategoryPageQuery
