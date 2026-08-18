import type { CategoryItem, CategoryInput, GetCategoriesParams, PaginatedCategoriesResponse, PageResponse } from '~/shared/types'

export type { CategoryItem, CategoryInput, GetCategoriesParams, PaginatedCategoriesResponse }

let MOCK_CATEGORIES: CategoryItem[] = [
  {
    id: "CAT-001",
    name: "Electronics",
    parentId: null,
    created_at: "2025-01-10T08:30:00Z",
    updated_at: "2025-01-15T10:20:00Z"
  },
  {
    id: "CAT-002",
    name: "Computers & Accessories",
    parentId: "CAT-001",
    created_at: "2025-01-11T09:15:00Z",
    updated_at: "2025-01-16T14:45:00Z"
  },
  {
    id: "CAT-003",
    name: "Audio & Headphones",
    parentId: "CAT-001",
    created_at: "2025-01-12T11:00:00Z",
    updated_at: "2025-01-18T16:30:00Z"
  },
  {
    id: "CAT-004",
    name: "Smart Home Devices",
    parentId: "CAT-001",
    created_at: "2025-01-14T07:45:00Z",
    updated_at: "2025-01-19T09:10:00Z"
  },
  {
    id: "CAT-005",
    name: "Wearable Technology",
    parentId: "CAT-001",
    created_at: "2025-01-15T13:20:00Z",
    updated_at: "2025-01-20T11:05:00Z"
  },
  {
    id: "CAT-006",
    name: "Gaming Gear",
    parentId: "CAT-002",
    created_at: "2025-01-16T15:10:00Z",
    updated_at: "2025-01-21T08:50:00Z"
  },
  {
    id: "CAT-007",
    name: "Mobile Phones & Tablets",
    parentId: "CAT-001",
    created_at: "2025-01-18T10:00:00Z",
    updated_at: "2025-01-22T17:15:00Z"
  },
  {
    id: "CAT-008",
    name: "Cameras & Photography",
    parentId: "CAT-001",
    created_at: "2025-01-19T14:30:00Z",
    updated_at: "2025-01-23T13:40:00Z"
  },
  {
    id: "CAT-009",
    name: "Storage & Networking",
    parentId: "CAT-002",
    created_at: "2025-01-20T16:05:00Z",
    updated_at: "2025-01-25T12:00:00Z"
  },
  {
    id: "CAT-010",
    name: "Office Electronics",
    parentId: "CAT-001",
    created_at: "2025-01-22T12:40:00Z",
    updated_at: "2025-01-26T15:25:00Z"
  },
  {
    id: "CAT-011",
    name: "Cables & Power Adapters",
    parentId: "CAT-001",
    created_at: "2025-01-24T09:50:00Z",
    updated_at: "2025-01-28T10:10:00Z"
  },
  {
    id: "CAT-012",
    name: "Monitors & Displays",
    parentId: "CAT-002",
    created_at: "2025-01-25T11:15:00Z",
    updated_at: "2025-01-29T14:00:00Z"
  }
]

function enrichCategoryWithParent(category: CategoryItem, allCats: CategoryItem[]): CategoryItem {
  if (!category.parentId) {
    return { ...category, parent: null }
  }
  const parent = allCats.find((c) => c.id === category.parentId)
  return {
    ...category,
    parent: parent ? { id: parent.id, name: parent.name } : null
  }
}

export async function getAllCategories(): Promise<CategoryItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return MOCK_CATEGORIES.map((cat) => enrichCategoryWithParent(cat, MOCK_CATEGORIES))
}

export async function getCategoryById(id: string): Promise<CategoryItem> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const category = MOCK_CATEGORIES.find((cat) => cat.id === id)
  if (!category) {
    throw new Error(`Category with ID ${id} not found`)
  }
  return enrichCategoryWithParent(category, MOCK_CATEGORIES)
}

export async function getCategories(params: GetCategoriesParams = {}): Promise<PageResponse<CategoryItem>> {
  const { pageNumber = 1, pageSize = 10, search = "", sortField, sortDir = "asc" } = params

  await new Promise((resolve) => setTimeout(resolve, 200))

  const cleanSearch = search.trim().toLowerCase()

  const enriched = MOCK_CATEGORIES.map((cat) => enrichCategoryWithParent(cat, MOCK_CATEGORIES))

  let filtered = cleanSearch
    ? enriched.filter(
        (cat) =>
          cat.name.toLowerCase().includes(cleanSearch) ||
          cat.id.toLowerCase().includes(cleanSearch) ||
          cat.parent?.name.toLowerCase().includes(cleanSearch)
      )
    : [...enriched]

  if (sortField) {
    filtered.sort((a, b) => {
      let valA = (a as any)[sortField] || ""
      let valB = (b as any)[sortField] || ""

      if (sortField === "id") {
        const numA = parseInt(String(valA).replace("CAT-", ""), 10)
        const numB = parseInt(String(valB).replace("CAT-", ""), 10)
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDir === "asc" ? numA - numB : numB - numA
        }
      }

      if (sortField === "parent") {
        valA = a.parent?.name || ""
        valB = b.parent?.name || ""
      }

      const comparison = String(valA).localeCompare(String(valB))
      return sortDir === "asc" ? comparison : -comparison
    })
  }

  const totalElements = filtered.length
  const totalPages = Math.ceil(totalElements / pageSize) || 1
  const currentPage = Math.max(1, Math.min(pageNumber, totalPages))

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const content = filtered.slice(startIndex, endIndex)

  return {
    content,
    pageNumber: currentPage,
    pageSize,
    totalElements,
    totalPages
  }
}

export async function createCategory(data: string | CategoryInput): Promise<CategoryItem> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const name = typeof data === "string" ? data : data.name
  const parentId = typeof data === "string" ? null : data.parentId === "none" ? null : data.parentId || null

  const maxNum = MOCK_CATEGORIES.reduce((max, item) => {
    const num = parseInt(item.id.replace("CAT-", ""), 10)
    return isNaN(num) ? max : Math.max(max, num)
  }, 0)
  const nextId = `CAT-${String(maxNum + 1).padStart(3, "0")}`
  const now = new Date().toISOString()
  const newCat: CategoryItem = {
    id: nextId,
    name: name.trim(),
    parentId: parentId || null,
    created_at: now,
    updated_at: now
  }
  MOCK_CATEGORIES = [newCat, ...MOCK_CATEGORIES]
  return enrichCategoryWithParent(newCat, MOCK_CATEGORIES)
}

export async function updateCategory(id: string, data: string | CategoryInput): Promise<CategoryItem> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const index = MOCK_CATEGORIES.findIndex((cat) => cat.id === id)
  if (index === -1) {
    throw new Error(`Category with ID ${id} not found`)
  }
  const name = typeof data === "string" ? data : data.name
  const parentId =
    typeof data === "string" ? MOCK_CATEGORIES[index].parentId : data.parentId === "none" ? null : data.parentId || null

  const now = new Date().toISOString()
  const updated: CategoryItem = {
    ...MOCK_CATEGORIES[index],
    name: name.trim(),
    parentId: parentId || null,
    updated_at: now
  }
  MOCK_CATEGORIES[index] = updated
  return enrichCategoryWithParent(updated, MOCK_CATEGORIES)
}

export async function deleteCategory(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = MOCK_CATEGORIES.findIndex((cat) => cat.id === id)
  if (index === -1) {
    throw new Error(`Category with ID ${id} not found`)
  }
  MOCK_CATEGORIES = MOCK_CATEGORIES.filter((cat) => cat.id !== id)
  return true
}
