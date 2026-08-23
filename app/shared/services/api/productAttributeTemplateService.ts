import type {
  ProductAttributeTemplateItem,
  ProductAttributeItem,
  GetProductAttributeTemplatesParams,
  PaginatedProductAttributeTemplatesResponse,
  PageResponse
} from '~/shared/types'
import { getAllProductAttributes } from './productAttributeService'

export type {
  ProductAttributeTemplateItem,
  GetProductAttributeTemplatesParams,
  PaginatedProductAttributeTemplatesResponse
}

let MOCK_TEMPLATES: ProductAttributeTemplateItem[] = [
  {
    id: 'PAT-001',
    name: 'Electronics & Gadgets Specifications',
    attribute_ids: ['ATTR-004', 'ATTR-005', 'ATTR-006', 'ATTR-008', 'ATTR-009', 'ATTR-010', 'ATTR-011', 'ATTR-012'],
    created_at: '2025-01-05T08:30:00Z',
    updated_at: '2025-01-10T10:15:00Z'
  },
  {
    id: 'PAT-002',
    name: 'Clothing & Apparel Sizing',
    attribute_ids: ['ATTR-001', 'ATTR-002', 'ATTR-003'],
    created_at: '2025-01-06T09:15:00Z',
    updated_at: '2025-01-12T14:20:00Z'
  },
  {
    id: 'PAT-003',
    name: 'Footwear & Shoes Matrix',
    attribute_ids: ['ATTR-001', 'ATTR-002', 'ATTR-003', 'ATTR-007'],
    created_at: '2025-01-08T11:00:00Z',
    updated_at: '2025-01-15T16:40:00Z'
  },
  {
    id: 'PAT-004',
    name: 'Computer Hardware & Components',
    attribute_ids: ['ATTR-004', 'ATTR-005', 'ATTR-009', 'ATTR-010'],
    created_at: '2025-01-10T14:25:00Z',
    updated_at: '2025-01-18T09:30:00Z'
  },
  {
    id: 'PAT-005',
    name: 'Furniture Dimensions & Materials',
    attribute_ids: ['ATTR-001', 'ATTR-002', 'ATTR-003', 'ATTR-007'],
    created_at: '2025-01-12T10:45:00Z',
    updated_at: '2025-01-20T11:50:00Z'
  },
  {
    id: 'PAT-006',
    name: 'Audio & Sound Systems Details',
    attribute_ids: ['ATTR-008', 'ATTR-009', 'ATTR-010'],
    created_at: '2025-01-15T13:20:00Z',
    updated_at: '2025-01-22T08:15:00Z'
  },
  {
    id: 'PAT-007',
    name: 'Smartphones & Mobile Devices',
    attribute_ids: ['ATTR-001', 'ATTR-004', 'ATTR-005', 'ATTR-006', 'ATTR-008', 'ATTR-012'],
    created_at: '2025-01-18T16:00:00Z',
    updated_at: '2025-01-24T17:35:00Z'
  },
  {
    id: 'PAT-008',
    name: 'Beauty & Skincare Formulations',
    attribute_ids: ['ATTR-003', 'ATTR-007', 'ATTR-010'],
    created_at: '2025-01-20T08:40:00Z',
    updated_at: '2025-01-26T12:10:00Z'
  },
  {
    id: 'PAT-009',
    name: 'Jewelry & Watches Craftsmanship',
    attribute_ids: ['ATTR-001', 'ATTR-003', 'ATTR-007', 'ATTR-010'],
    created_at: '2025-01-22T15:10:00Z',
    updated_at: '2025-01-28T10:00:00Z'
  },
  {
    id: 'PAT-010',
    name: 'Automotive Accessories & Parts',
    attribute_ids: ['ATTR-003', 'ATTR-007', 'ATTR-010'],
    created_at: '2025-01-25T11:30:00Z',
    updated_at: '2025-01-30T15:45:00Z'
  },
  {
    id: 'PAT-011',
    name: 'Sports & Outdoor Equipment',
    attribute_ids: ['ATTR-001', 'ATTR-002', 'ATTR-003', 'ATTR-007'],
    created_at: '2025-01-28T09:00:00Z',
    updated_at: '2025-02-02T13:20:00Z'
  },
  {
    id: 'PAT-012',
    name: 'Home Appliances & Power Specs',
    attribute_ids: ['ATTR-001', 'ATTR-007', 'ATTR-010'],
    created_at: '2025-01-30T14:15:00Z',
    updated_at: '2025-02-05T16:50:00Z'
  }
]

async function populateTemplateAttributes(
  template: ProductAttributeTemplateItem
): Promise<ProductAttributeTemplateItem> {
  const allAttributes = await getAllProductAttributes()
  const attrMap = new Map(allAttributes.map((a) => [a.id, a]))
  const attributes = (template.attribute_ids || [])
    .map((id) => attrMap.get(id))
    .filter(Boolean) as ProductAttributeItem[]
  return {
    ...template,
    attributes
  }
}

export async function getProductAttributeTemplates(
  params: GetProductAttributeTemplatesParams = {}
): Promise<PageResponse<ProductAttributeTemplateItem>> {
  const { pageNumber = 1, pageSize = 10, search = '', sortField, sortDir = 'asc' } = params

  await new Promise((resolve) => setTimeout(resolve, 200))

  const cleanSearch = search.trim().toLowerCase()

  let filtered = cleanSearch
    ? MOCK_TEMPLATES.filter(
        (template) =>
          template.name.toLowerCase().includes(cleanSearch) ||
          template.id.toLowerCase().includes(cleanSearch)
      )
    : [...MOCK_TEMPLATES]

  if (sortField) {
    filtered.sort((a, b) => {
      const valA = (a as unknown as Record<string, string>)[sortField] || ''
      const valB = (b as unknown as Record<string, string>)[sortField] || ''

      if (sortField === 'id') {
        const numA = parseInt(String(valA).replace('PAT-', ''), 10)
        const numB = parseInt(String(valB).replace('PAT-', ''), 10)
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
  const rawContent = filtered.slice(startIndex, endIndex)

  const content = await Promise.all(rawContent.map((t) => populateTemplateAttributes(t)))

  return {
    content,
    pageNumber: currentPage,
    pageSize,
    totalElements,
    totalPages
  }
}

export async function getProductAttributeTemplateById(id: string): Promise<ProductAttributeTemplateItem> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const template = MOCK_TEMPLATES.find((t) => t.id === id)
  if (!template) {
    throw new Error(`Product Attribute Template with ID ${id} not found`)
  }
  return populateTemplateAttributes(template)
}

export async function createProductAttributeTemplate(data: {
  name: string
  attribute_ids?: string[]
}): Promise<ProductAttributeTemplateItem> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const maxNum = MOCK_TEMPLATES.reduce((max, item) => {
    const num = parseInt(item.id.replace('PAT-', ''), 10)
    return isNaN(num) ? max : Math.max(max, num)
  }, 0)
  const nextId = `PAT-${String(maxNum + 1).padStart(3, '0')}`
  const now = new Date().toISOString()

  const newTemplate: ProductAttributeTemplateItem = {
    id: nextId,
    name: data.name.trim(),
    attribute_ids: data.attribute_ids || [],
    created_at: now,
    updated_at: now
  }
  MOCK_TEMPLATES = [newTemplate, ...MOCK_TEMPLATES]
  return populateTemplateAttributes(newTemplate)
}

export async function updateProductAttributeTemplate(
  id: string,
  data: { name: string; attribute_ids?: string[] }
): Promise<ProductAttributeTemplateItem> {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const index = MOCK_TEMPLATES.findIndex((t) => t.id === id)
  if (index === -1) {
    throw new Error(`Product Attribute Template with ID ${id} not found`)
  }
  const now = new Date().toISOString()
  const updated: ProductAttributeTemplateItem = {
    ...MOCK_TEMPLATES[index],
    name: data.name.trim(),
    attribute_ids: data.attribute_ids !== undefined ? data.attribute_ids : MOCK_TEMPLATES[index].attribute_ids,
    updated_at: now
  }
  MOCK_TEMPLATES[index] = updated
  return populateTemplateAttributes(updated)
}

export async function deleteProductAttributeTemplate(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = MOCK_TEMPLATES.findIndex((t) => t.id === id)
  if (index === -1) {
    throw new Error(`Product Attribute Template with ID ${id} not found`)
  }
  MOCK_TEMPLATES = MOCK_TEMPLATES.filter((t) => t.id !== id)
  return true
}

export async function getAllProductAttributeTemplates(): Promise<ProductAttributeTemplateItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return Promise.all(MOCK_TEMPLATES.map((t) => populateTemplateAttributes(t)))
}


