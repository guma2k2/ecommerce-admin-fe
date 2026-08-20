import type {
  ProductAttributeItem,
  GetProductAttributesParams,
  PaginatedProductAttributesResponse,
  PageResponse
} from '~/shared/types'

export type {
  ProductAttributeItem,
  GetProductAttributesParams,
  PaginatedProductAttributesResponse
}

let MOCK_ATTRIBUTES: ProductAttributeItem[] = [
  {
    id: 'ATTR-001',
    name: 'Color',
    created_at: '2025-01-05T08:30:00Z',
    updated_at: '2025-01-10T10:15:00Z'
  },
  {
    id: 'ATTR-002',
    name: 'Size',
    created_at: '2025-01-06T09:15:00Z',
    updated_at: '2025-01-12T14:20:00Z'
  },
  {
    id: 'ATTR-003',
    name: 'Material',
    created_at: '2025-01-08T11:00:00Z',
    updated_at: '2025-01-15T16:40:00Z'
  },
  {
    id: 'ATTR-004',
    name: 'Storage Capacity',
    created_at: '2025-01-10T14:25:00Z',
    updated_at: '2025-01-18T09:30:00Z'
  },
  {
    id: 'ATTR-005',
    name: 'RAM',
    created_at: '2025-01-12T10:45:00Z',
    updated_at: '2025-01-20T11:50:00Z'
  },
  {
    id: 'ATTR-006',
    name: 'Screen Size',
    created_at: '2025-01-15T13:20:00Z',
    updated_at: '2025-01-22T08:15:00Z'
  },
  {
    id: 'ATTR-007',
    name: 'Weight',
    created_at: '2025-01-18T16:00:00Z',
    updated_at: '2025-01-24T17:35:00Z'
  },
  {
    id: 'ATTR-008',
    name: 'Battery Capacity',
    created_at: '2025-01-20T08:40:00Z',
    updated_at: '2025-01-26T12:10:00Z'
  },
  {
    id: 'ATTR-009',
    name: 'Connectivity',
    created_at: '2025-01-22T15:10:00Z',
    updated_at: '2025-01-28T10:00:00Z'
  },
  {
    id: 'ATTR-010',
    name: 'Warranty Period',
    created_at: '2025-01-25T11:30:00Z',
    updated_at: '2025-01-30T15:45:00Z'
  },
  {
    id: 'ATTR-011',
    name: 'Resolution',
    created_at: '2025-01-28T09:00:00Z',
    updated_at: '2025-02-02T13:20:00Z'
  },
  {
    id: 'ATTR-012',
    name: 'Operating System',
    created_at: '2025-01-30T14:15:00Z',
    updated_at: '2025-02-05T16:50:00Z'
  }
]

export async function getProductAttributes(
  params: GetProductAttributesParams = {}
): Promise<PageResponse<ProductAttributeItem>> {
  const { pageNumber = 1, pageSize = 10, search = '', sortField, sortDir = 'asc' } = params

  await new Promise((resolve) => setTimeout(resolve, 200))

  const cleanSearch = search.trim().toLowerCase()

  let filtered = cleanSearch
    ? MOCK_ATTRIBUTES.filter(
        (attr) =>
          attr.name.toLowerCase().includes(cleanSearch) ||
          attr.id.toLowerCase().includes(cleanSearch)
      )
    : [...MOCK_ATTRIBUTES]

  if (sortField) {
    filtered.sort((a, b) => {
      const valA = (a as unknown as Record<string, string>)[sortField] || ''
      const valB = (b as unknown as Record<string, string>)[sortField] || ''

      if (sortField === 'id') {
        const numA = parseInt(String(valA).replace('ATTR-', ''), 10)
        const numB = parseInt(String(valB).replace('ATTR-', ''), 10)
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDir === 'asc' ? numA - numB : numB - numA
        }
      }

      const comp = String(valA).localeCompare(String(valB))
      return sortDir === 'asc' ? comp : -comp
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

export async function getProductAttributeById(id: string): Promise<ProductAttributeItem> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const attr = MOCK_ATTRIBUTES.find((a) => a.id === id)
  if (!attr) {
    throw new Error(`Product Attribute with ID ${id} not found`)
  }
  return attr
}

export async function createProductAttribute(data: {
  name: string
}): Promise<ProductAttributeItem> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const maxNum = MOCK_ATTRIBUTES.reduce((max, item) => {
    const num = parseInt(item.id.replace('ATTR-', ''), 10)
    return isNaN(num) ? max : Math.max(max, num)
  }, 0)
  const nextId = `ATTR-${String(maxNum + 1).padStart(3, '0')}`
  const now = new Date().toISOString()

  const newAttr: ProductAttributeItem = {
    id: nextId,
    name: data.name.trim(),
    created_at: now,
    updated_at: now
  }
  MOCK_ATTRIBUTES = [newAttr, ...MOCK_ATTRIBUTES]
  return newAttr
}

export async function updateProductAttribute(
  id: string,
  data: { name: string }
): Promise<ProductAttributeItem> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const index = MOCK_ATTRIBUTES.findIndex((a) => a.id === id)
  if (index === -1) {
    throw new Error(`Product Attribute with ID ${id} not found`)
  }
  const now = new Date().toISOString()
  const updated: ProductAttributeItem = {
    ...MOCK_ATTRIBUTES[index],
    name: data.name.trim(),
    updated_at: now
  }
  MOCK_ATTRIBUTES[index] = updated
  return updated
}

export async function deleteProductAttribute(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = MOCK_ATTRIBUTES.findIndex((a) => a.id === id)
  if (index === -1) {
    throw new Error(`Product Attribute with ID ${id} not found`)
  }
  MOCK_ATTRIBUTES = MOCK_ATTRIBUTES.filter((a) => a.id !== id)
  return true
}

export async function getAllProductAttributes(): Promise<ProductAttributeItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return [...MOCK_ATTRIBUTES]
}

