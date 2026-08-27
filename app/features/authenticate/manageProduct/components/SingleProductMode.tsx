import React from "react"
import { DollarSign, Package } from "lucide-react"
import { Input } from "~/core/components/shadcn/input"
import PriceInput from "~/shared/components/PriceInput"

export interface SingleProductModeProps {
  price: number
  quantity: number
  sku: string
  onPriceChange: (value: number) => void
  onQuantityChange: (value: number) => void
  onSkuChange: (value: string) => void
}

export default function SingleProductMode({
  price,
  quantity,
  sku,
  onPriceChange,
  onQuantityChange,
  onSkuChange
}: SingleProductModeProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <DollarSign className="size-3.5 text-emerald-600" />
          Price ($) *
        </label>
        <PriceInput
          value={price ?? 0}
          onChange={onPriceChange}
          placeholder="0.00"
          className="bg-gray-50/50 dark:bg-zinc-800/50 font-medium"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <Package className="size-3.5 text-blue-600" />
          Available Stock *
        </label>
        <Input
          type="number"
          min="0"
          placeholder="0"
          value={quantity ?? 0}
          onChange={(e) => onQuantityChange(parseInt(e.target.value, 10) || 0)}
          className="bg-gray-50/50 dark:bg-zinc-800/50"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          SKU (Stock Keeping Unit) *
        </label>
        <Input
          type="text"
          placeholder="e.g. NK-AM270-001"
          value={sku ?? ""}
          onChange={(e) => onSkuChange(e.target.value)}
          className="bg-gray-50/50 dark:bg-zinc-800/50 font-mono text-xs"
        />
      </div>
    </div>
  )
}
