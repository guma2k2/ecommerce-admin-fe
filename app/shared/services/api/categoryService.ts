import apiClient from '~/shared/services/axiosClient'
import type {
  ApiResponse,
  CategoryCreateRequest,
  CategoryInput,
  CategoryItem,
  CategoryResponse,
  CategoryUpdateRequest,
  GetCategoriesParams,
  PageResponse,
  PaginationParams,
  PaginatedCategoriesResponse
} from '~/shared/types'

export type {
  CategoryItem,
  CategoryResponse,
  CategoryInput,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  GetCategoriesParams,
  PaginatedCategoriesResponse
}

/**
 * Recursively flattens a category tree and enriches each node with parent reference.
 */
export function flattenCategoryTree(
  tree: CategoryResponse[],
  parent: { id: number | string; name: string } | null = null
): CategoryItem[] {
  const result: CategoryItem[] = []

  for (const node of tree) {
    const item: CategoryItem = {
      id: node.id,
      name: node.name,
      parentId: parent ? parent.id : null,
      parent: parent ? { id: parent.id, name: parent.name } : null,
      children: node.children || [],
      createdAt: node.createdAt || null,
      updatedAt: node.updatedAt || null,
      created_at: node.createdAt || null,
      updated_at: node.updatedAt || null
    }
    result.push(item)

    if (node.children && node.children.length > 0) {
      result.push(...flattenCategoryTree(node.children, { id: node.id, name: node.name }))
    }
  }

  return result
}

/**
 * Fetches a paginated list of categories from the backend API.
 * Uses 0-based page numbering as required by backend.
 */
export async function getCategoriesPage(
  params: PaginationParams & { search?: string } = {}
): Promise<PageResponse<CategoryResponse>> {
  const pageNumber = params.pageNumber !== undefined ? Math.max(0, params.pageNumber) : 0
  const pageSize = params.pageSize ?? 10

  const response = await apiClient.get<ApiResponse<PageResponse<CategoryResponse>>>('/categories/page', {
    params: {
      pageNumber,
      pageSize,
      ...(params.search?.trim() ? { search: params.search.trim() } : {})
    }
  })

  return response.data.data
}

/**
 * Helper for React Router clientLoader & UI components using 1-based page numbers.
 */
export async function getCategories(
  params: GetCategoriesParams = {}
): Promise<PageResponse<CategoryItem>> {
  const uiPageNumber = params.pageNumber ?? 1
  const zeroBasedPage = Math.max(0, uiPageNumber - 1)
  const pageSize = params.pageSize ?? 10

  const response = await apiClient.get<ApiResponse<PageResponse<CategoryResponse>>>('/categories/page', {
    params: {
      pageNumber: zeroBasedPage,
      pageSize,
      ...(params.search?.trim() ? { search: params.search.trim() } : {})
    }
  })

  const data = response.data.data
  const rawContent = data.content || []
  const flattened = flattenCategoryTree(rawContent)

  let content = flattened
  if (params.search?.trim()) {
    const term = params.search.trim().toLowerCase()
    content = content.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        String(c.id).includes(term) ||
        c.parent?.name.toLowerCase().includes(term)
    )
  }

  if (params.sortField) {
    content = [...content].sort((a, b) => {
      let valA = (a as unknown as Record<string, string>)[params.sortField!] ?? ''
      let valB = (b as unknown as Record<string, string>)[params.sortField!] ?? ''

      if (params.sortField === 'parent') {
        valA = a.parent?.name || ''
        valB = b.parent?.name || ''
      }

      const comp = String(valA).localeCompare(String(valB))
      return params.sortDir === 'desc' ? -comp : comp
    })
  }

  return {
    ...data,
    content,
    pageNumber: uiPageNumber
  }
}

/**
 * Fetches a single category with its nested children hierarchy tree.
 */
export async function getCategoryById(categoryId: number | string): Promise<CategoryResponse> {
  const response = await apiClient.get<ApiResponse<CategoryResponse>>(`/categories/${categoryId}`)
  return response.data.data
}

/**
 * Creates a new category (root or child).
 */
export async function createCategory(payload: CategoryCreateRequest | CategoryInput | string): Promise<void> {
  let name = ''
  let parentId: number | null = null

  if (typeof payload === 'string') {
    name = payload.trim()
  } else {
    name = payload.name.trim()
    if (payload.parentId !== undefined && payload.parentId !== null && payload.parentId !== 'none') {
      const parsedId = typeof payload.parentId === 'number' ? payload.parentId : parseInt(String(payload.parentId), 10)
      parentId = isNaN(parsedId) ? null : parsedId
    }
  }

  await apiClient.post<ApiResponse<void>>('/categories', {
    name,
    parentId
  })
}

/**
 * Updates an existing category by ID.
 */
export async function updateCategory(
  categoryId: number | string,
  payload: CategoryUpdateRequest | CategoryInput | string
): Promise<void> {
  let name = ''
  let parentId: number | null = null

  if (typeof payload === 'string') {
    name = payload.trim()
  } else {
    name = payload.name.trim()
    if (payload.parentId !== undefined && payload.parentId !== null && payload.parentId !== 'none') {
      const parsedId = typeof payload.parentId === 'number' ? payload.parentId : parseInt(String(payload.parentId), 10)
      parentId = isNaN(parsedId) ? null : parsedId
    }
  }

  await apiClient.put<ApiResponse<void>>(`/categories/${categoryId}`, {
    name,
    parentId
  })
}

/**
 * Deletes a category by ID.
 */
export async function deleteCategory(categoryId: number | string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/categories/${categoryId}`)
}

/**
 * Fetches all categories and flattens tree for select dropdowns.
 */
export async function getAllCategories(): Promise<CategoryItem[]> {
  try {
    const res = await getCategoriesPage({ pageNumber: 0, pageSize: 1000 })
    return flattenCategoryTree(res.content || [])
  } catch (err) {
    console.error('Failed to load all categories:', err)
    return []
  }
}

export const categoryService = {
  getCategoriesPage,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  flattenCategoryTree
}

export default categoryService
