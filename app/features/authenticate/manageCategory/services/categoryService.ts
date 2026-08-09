export interface CategoryItem {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface GetCategoriesParams {
  page?: number
  limit?: number
  search?: string
}

export interface PaginatedCategoriesResponse {
  data: CategoryItem[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

let MOCK_CATEGORIES: CategoryItem[] = [
  {
    id: "CAT-001",
    name: "Electronics",
    created_at: "2025-01-10T08:30:00Z",
    updated_at: "2025-01-15T10:20:00Z"
  },
  {
    id: "CAT-002",
    name: "Computers & Accessories",
    created_at: "2025-01-11T09:15:00Z",
    updated_at: "2025-01-16T14:45:00Z"
  },
  {
    id: "CAT-003",
    name: "Audio & Headphones",
    created_at: "2025-01-12T11:00:00Z",
    updated_at: "2025-01-18T16:30:00Z"
  },
  {
    id: "CAT-004",
    name: "Smart Home Devices",
    created_at: "2025-01-14T07:45:00Z",
    updated_at: "2025-01-19T09:10:00Z"
  },
  {
    id: "CAT-005",
    name: "Wearable Technology",
    created_at: "2025-01-15T13:20:00Z",
    updated_at: "2025-01-20T11:05:00Z"
  },
  {
    id: "CAT-006",
    name: "Gaming Gear",
    created_at: "2025-01-16T15:10:00Z",
    updated_at: "2025-01-21T08:50:00Z"
  },
  {
    id: "CAT-007",
    name: "Mobile Phones & Tablets",
    created_at: "2025-01-18T10:00:00Z",
    updated_at: "2025-01-22T17:15:00Z"
  },
  {
    id: "CAT-008",
    name: "Cameras & Photography",
    created_at: "2025-01-19T14:30:00Z",
    updated_at: "2025-01-23T13:40:00Z"
  },
  {
    id: "CAT-009",
    name: "Storage & Networking",
    created_at: "2025-01-20T16:05:00Z",
    updated_at: "2025-01-25T12:00:00Z"
  },
  {
    id: "CAT-010",
    name: "Office Electronics",
    created_at: "2025-01-22T12:40:00Z",
    updated_at: "2025-01-26T15:25:00Z"
  },
  {
    id: "CAT-011",
    name: "Cables & Power Adapters",
    created_at: "2025-01-24T09:50:00Z",
    updated_at: "2025-01-28T10:10:00Z"
  },
  {
    id: "CAT-012",
    name: "Monitors & Displays",
    created_at: "2025-01-25T11:15:00Z",
    updated_at: "2025-01-29T14:00:00Z"
  }
]

export async function getCategories(
  params: GetCategoriesParams = {}
): Promise<PaginatedCategoriesResponse> {
  const { page = 1, limit = 10, search = "" } = params

  await new Promise((resolve) => setTimeout(resolve, 200))

  const cleanSearch = search.trim().toLowerCase()

  const filtered = cleanSearch
    ? MOCK_CATEGORIES.filter(
        (cat) =>
          cat.name.toLowerCase().includes(cleanSearch) ||
          cat.id.toLowerCase().includes(cleanSearch)
      )
    : MOCK_CATEGORIES

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / limit) || 1
  const currentPage = Math.max(1, Math.min(page, totalPages))

  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit
  const data = filtered.slice(startIndex, endIndex)

  return {
    data,
    pagination: {
      page: currentPage,
      limit,
      totalItems,
      totalPages
    }
  }
}

export async function createCategory(name: string): Promise<CategoryItem> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const maxNum = MOCK_CATEGORIES.reduce((max, item) => {
    const num = parseInt(item.id.replace("CAT-", ""), 10)
    return isNaN(num) ? max : Math.max(max, num)
  }, 0)
  const nextId = `CAT-${String(maxNum + 1).padStart(3, "0")}`
  const now = new Date().toISOString()
  const newCat: CategoryItem = {
    id: nextId,
    name: name.trim(),
    created_at: now,
    updated_at: now
  }
  MOCK_CATEGORIES = [newCat, ...MOCK_CATEGORIES]
  return newCat
}

export async function updateCategory(id: string, name: string): Promise<CategoryItem> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const index = MOCK_CATEGORIES.findIndex((cat) => cat.id === id)
  if (index === -1) {
    throw new Error(`Category with ID ${id} not found`)
  }
  const now = new Date().toISOString()
  const updated: CategoryItem = {
    ...MOCK_CATEGORIES[index],
    name: name.trim(),
    updated_at: now
  }
  MOCK_CATEGORIES[index] = updated
  return updated
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
