import type { PageResponse, SortDirection } from './pagination'
import type { ProductAttributeItem } from './productAttribute'

export interface ProductAttributeTemplateItem {
  id: string
  name: string
  attribute_ids?: string[]
  attributes?: ProductAttributeItem[]
  created_at: string
  updated_at: string
}

export interface GetProductAttributeTemplatesParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedProductAttributeTemplatesResponse = PageResponse<ProductAttributeTemplateItem>

export type ProductAttributeTemplateSortField = 'id' | 'name' | 'created_at' | 'updated_at'
