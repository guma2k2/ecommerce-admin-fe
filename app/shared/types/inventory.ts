import type { SortDirection } from './pagination'

export type StockAdjustmentReason = 'RESTOCK' | 'CORRECTION'

export type MovementType =
  | 'INITIALIZATION'
  | 'ORDER_DEDUCTION'
  | 'RESERVATION_RELEASE'
  | 'ADJUSTMENT'
  | 'CYCLE_COUNT'

export interface InventoryItem {
  id: number
  productVariantId: number
  sku: string
  onHand: number
  reserved: number
  available: number
  createdAt: string
  updatedAt: string
}

export interface StockMovementItem {
  id: number
  productVariantId: number
  quantityChange: number
  quantityBefore: number
  quantityAfter: number
  movementType: MovementType
  reason: string
  referenceId?: string
  note?: string
  performedBy: string
  createdAt: string
}

export interface StockAdjustmentPayload {
  productVariantId: number
  quantityChange: number
  reason: StockAdjustmentReason
  note?: string
}

export interface CycleCountPayload {
  productVariantId: number
  physicalCount: number
  referenceId: string
  note?: string
}

export interface GetInventoriesParams {
  pageNumber?: number
  pageSize?: number
  search?: string
  sortField?: keyof InventoryItem
  sortDir?: SortDirection
}

export interface InventorySummary {
  totalSkus: number
  totalOnHand: number
  totalReserved: number
  lowStockCount: number
  outOfStockCount: number
}
