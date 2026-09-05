import type { PageResponse, SortDirection } from './pagination'
import type { ProductVariant } from './ProductVariant'

export interface ProductItem {
  id: string
  name: string
  image: string
  created_at: string
  updated_at: string
}

export interface GetProductsParams {
  pageNumber?: number
  pageSize?: number
  sortField?: string
  sortDir?: SortDirection
  search?: string
}

export type PaginatedProductsResponse = PageResponse<ProductItem>

export type { ProductVariant }

// ==========================================
// Product API Types (from product-api.md)
// ==========================================

// Media
export interface ProductMediaRequest {
  mediaId: string
  position: number
}

export interface ProductMediaResponse {
  mediaId: string
  position: number
  url: string | null
  variantIds?: number[]
}

// Option & Values (Create)
export interface ProductOptionValueCreateRequest {
  value: string
  position: number
}

export interface ProductOptionCombinationCreateRequest {
  productOptionId?: number
  name?: string
  position: number
  values: ProductOptionValueCreateRequest[]
}

// Option & Values (Update)
export interface ProductOptionValueUpdateRequest {
  id?: number | null
  value: string
  position: number
}

export interface ProductOptionCombinationUpdateRequest {
  productOptionId?: number
  name?: string
  position: number
  values: ProductOptionValueUpdateRequest[]
}

// Option Responses
export interface ProductOptionValueResponse {
  id: number
  value: string
  position: number
}

export interface ProductOptionCombinationResponse {
  productOptionId: number
  name: string
  position: number
  values: ProductOptionValueResponse[]
}

// Attributes
export interface ProductAttributeValueRequest {
  productAttributeId: number
  value: string
}

export interface ProductAttributeValueResponse {
  productAttributeId: number
  name: string
  value: string
}

// Variants
export interface ProductVariantCreateRequest {
  title?: string
  sku: string
  price: number
  quantity: number
  mediaId?: string
  attributes?: ProductAttributeValueRequest[]
  attributeValues?: ProductAttributeValueRequest[]
}

export interface ProductVariantUpdateRequest {
  id?: number | null
  title?: string
  sku: string
  price: number
  quantity: number
  mediaId?: string
  attributes?: ProductAttributeValueRequest[]
  attributeValues?: ProductAttributeValueRequest[]
}

export interface ProductVariantResponse {
  id: number
  title: string
  productOptionValueIds: number[]
  sku: string
  price: number
  quantity: number
  attributes?: ProductAttributeValueResponse[]
}

// Product Create Request
export interface ProductCreateRequest {
  name: string
  description?: string
  slug: string
  metaTitle?: string
  metaKeyword?: string
  metaDescription?: string
  categoryId?: number | null
  brandId?: number | null
  medias?: ProductMediaRequest[]
  options?: ProductOptionCombinationCreateRequest[]
  attributes?: ProductAttributeValueRequest[]
  variants: ProductVariantCreateRequest[]
}

// Product Update Request
export interface ProductUpdateRequest {
  name: string
  description?: string
  slug: string
  metaTitle?: string
  metaKeyword?: string
  metaDescription?: string
  categoryId?: number | null
  brandId?: number | null
  medias?: ProductMediaRequest[]
  options?: ProductOptionCombinationUpdateRequest[]
  attributes?: ProductAttributeValueRequest[]
  variants: ProductVariantUpdateRequest[]
}

// Full Product Response
export interface ProductResponse {
  id: number
  name: string
  description: string | null
  slug: string
  metaTitle: string | null
  metaKeyword: string | null
  metaDescription: string | null
  brand: {
    id: number
    name: string
    description?: string
    createdAt?: string | null
    updatedAt?: string | null
  } | null
  medias: ProductMediaResponse[]
  attributes: ProductAttributeValueResponse[]
  options: ProductOptionCombinationResponse[]
  variants: ProductVariantResponse[]
  createdAt: string | null
  updatedAt: string | null
}
