import type { BrandItem, GetBrandsParams, PaginatedBrandsResponse, PageResponse } from '~/shared/types'

export type { BrandItem, GetBrandsParams, PaginatedBrandsResponse }

let MOCK_BRANDS: BrandItem[] = [
  {
    id: "BRAND-001",
    name: "Apple Inc.",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=150&auto=format&fit=crop&q=80",
    created_at: "2025-01-05T09:00:00Z",
    updated_at: "2025-01-10T11:20:00Z"
  },
  {
    id: "BRAND-002",
    name: "Samsung Electronics",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&auto=format&fit=crop&q=80",
    created_at: "2025-01-06T10:15:00Z",
    updated_at: "2025-01-12T14:30:00Z"
  },
  {
    id: "BRAND-003",
    name: "Sony",
    image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=150&auto=format&fit=crop&q=80",
    created_at: "2025-01-08T08:45:00Z",
    updated_at: "2025-01-14T16:10:00Z"
  },
  {
    id: "BRAND-004",
    name: "Logitech",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80",
    created_at: "2025-01-10T12:00:00Z",
    updated_at: "2025-01-15T09:50:00Z"
  },
  {
    id: "BRAND-005",
    name: "Dell Technologies",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=150&auto=format&fit=crop&q=80",
    created_at: "2025-01-12T14:20:00Z",
    updated_at: "2025-01-18T10:15:00Z"
  },
  {
    id: "BRAND-006",
    name: "ASUS ROG",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80",
    created_at: "2025-01-15T11:30:00Z",
    updated_at: "2025-01-20T13:40:00Z"
  },
  {
    id: "BRAND-007",
    name: "Bose Sound",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=150&auto=format&fit=crop&q=80",
    created_at: "2025-01-18T15:10:00Z",
    updated_at: "2025-01-22T08:25:00Z"
  },
  {
    id: "BRAND-008",
    name: "Razer Gaming",
    image: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=150&auto=format&fit=crop&q=80",
    created_at: "2025-01-20T09:40:00Z",
    updated_at: "2025-01-24T17:00:00Z"
  },
  {
    id: "BRAND-009",
    name: "Corsair",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80",
    created_at: "2025-01-22T13:05:00Z",
    updated_at: "2025-01-26T15:45:00Z"
  },
  {
    id: "BRAND-010",
    name: "Anker Innovations",
    image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=150&auto=format&fit=crop&q=80",
    created_at: "2025-01-25T16:50:00Z",
    updated_at: "2025-01-28T12:10:00Z"
  }
]

export async function getBrands(
  params: GetBrandsParams = {}
): Promise<PageResponse<BrandItem>> {
  const { pageNumber = 1, pageSize = 10, search = "", sortField, sortDir = "asc" } = params

  await new Promise((resolve) => setTimeout(resolve, 200))

  const cleanSearch = search.trim().toLowerCase()

  let filtered = cleanSearch
    ? MOCK_BRANDS.filter((brand) =>
        brand.name.toLowerCase().includes(cleanSearch)
      )
    : [...MOCK_BRANDS]

  if (sortField) {
    filtered.sort((a, b) => {
      const valA = (a as any)[sortField] || ""
      const valB = (b as any)[sortField] || ""
      const comp = String(valA).localeCompare(String(valB))
      return sortDir === "asc" ? comp : -comp
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

export async function createBrand(data: { name: string; image?: string }): Promise<BrandItem> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const maxNum = MOCK_BRANDS.reduce((max, item) => {
    const num = parseInt(item.id.replace("BRAND-", ""), 10)
    return isNaN(num) ? max : Math.max(max, num)
  }, 0)
  const nextId = `BRAND-${String(maxNum + 1).padStart(3, "0")}`
  const now = new Date().toISOString()
  const defaultImage = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80"
  
  const newBrand: BrandItem = {
    id: nextId,
    name: data.name.trim(),
    image: data.image?.trim() || defaultImage,
    created_at: now,
    updated_at: now
  }
  MOCK_BRANDS = [newBrand, ...MOCK_BRANDS]
  return newBrand
}

export async function updateBrand(
  id: string,
  data: { name: string; image?: string }
): Promise<BrandItem> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const index = MOCK_BRANDS.findIndex((b) => b.id === id)
  if (index === -1) {
    throw new Error(`Brand with ID ${id} not found`)
  }
  const now = new Date().toISOString()
  const updated: BrandItem = {
    ...MOCK_BRANDS[index],
    name: data.name.trim(),
    image: data.image?.trim() || MOCK_BRANDS[index].image,
    updated_at: now
  }
  MOCK_BRANDS[index] = updated
  return updated
}

export async function deleteBrand(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = MOCK_BRANDS.findIndex((b) => b.id === id)
  if (index === -1) {
    throw new Error(`Brand with ID ${id} not found`)
  }
  MOCK_BRANDS = MOCK_BRANDS.filter((b) => b.id !== id)
  return true
}

export async function getBrandById(id: string): Promise<BrandItem> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const brand = MOCK_BRANDS.find((b) => b.id === id)
  if (!brand) {
    throw new Error(`Brand with ID ${id} not found`)
  }
  return brand
}

export async function getAllBrands(): Promise<BrandItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return [...MOCK_BRANDS]
}

