import React, { useState } from "react"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import PriceInput from "~/shared/components/PriceInput"
import ProductVariantRow, { type VariantRowItem } from "./ProductVariantRow"
import ProductVariantSpecsRow, { type VariantAttribute } from "./ProductVariantSpecsRow"

export interface ProductVariantsMatrixTableProps {
  variants: VariantRowItem[]
  selectedIndices: number[]
  expandedIndices: number[]
  onSelectAll: (checked: boolean) => void
  onSelectVariant: (index: number, checked: boolean) => void
  onToggleExpand: (index: number) => void
  onApplyBulkPrice: (price: number) => void
  onApplyBulkStock: (stock: number) => void
  onUpdateVariantField: (index: number, field: string, value: any) => void
  onAddVariantAttribute: (index: number) => void
  onUpdateVariantAttribute: (
    variantIndex: number,
    attrIndex: number,
    field: "productAttributeId" | "name" | "value",
    val: any
  ) => void
  onRemoveVariantAttribute: (variantIndex: number, attrIndex: number) => void
  onCopyAttributesToSelected: (sourceVariantIndex: number) => void
}

export default function ProductVariantsMatrixTable({
  variants,
  selectedIndices,
  expandedIndices,
  onSelectAll,
  onSelectVariant,
  onToggleExpand,
  onApplyBulkPrice,
  onApplyBulkStock,
  onUpdateVariantField,
  onAddVariantAttribute,
  onUpdateVariantAttribute,
  onRemoveVariantAttribute,
  onCopyAttributesToSelected
}: ProductVariantsMatrixTableProps) {
  const [bulkPrice, setBulkPrice] = useState("")
  const [bulkStock, setBulkStock] = useState("")

  const handleApplyPrice = () => {
    const p = parseFloat(bulkPrice)
    if (isNaN(p) || p < 0) return
    onApplyBulkPrice(p)
    setBulkPrice("")
  }

  const handleApplyStock = () => {
    const q = parseInt(bulkStock, 10)
    if (isNaN(q) || q < 0) return
    onApplyBulkStock(q)
    setBulkStock("")
  }

  return (
    <div className="space-y-3 pt-2">
      {/* Bulk Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={variants.length > 0 && selectedIndices.length === variants.length}
            onCheckedChange={(c) => onSelectAll(!!c)}
          />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {selectedIndices.length > 0
              ? `${selectedIndices.length} of ${variants.length} selected`
              : `Total ${variants.length} SKU(s)`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <PriceInput
              placeholder="Bulk Price ($)"
              value={bulkPrice ? parseFloat(bulkPrice) : ""}
              onChange={(val) => setBulkPrice(val ? String(val) : "")}
              className="h-7 w-28 bg-white dark:bg-zinc-900 text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyPrice}
              className="h-7 px-2 text-xs"
            >
              Apply
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Bulk Stock"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              className="h-7 w-24 bg-white dark:bg-zinc-900 text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyStock}
              className="h-7 px-2 text-xs"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 overflow-x-auto bg-white dark:bg-zinc-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 dark:bg-zinc-800/50 text-gray-500 font-medium border-b border-gray-200 dark:border-zinc-800">
            <tr>
              <th className="py-2.5 px-3 w-8"></th>
              <th className="py-2.5 px-3 w-14">Image</th>
              <th className="py-2.5 px-3 min-w-[160px]">Variant Combination</th>
              <th className="py-2.5 px-3 min-w-[140px]">SKU *</th>
              <th className="py-2.5 px-3 w-28">Price ($) *</th>
              <th className="py-2.5 px-3 w-24">Available *</th>
              <th className="py-2.5 px-3 w-32 text-right">Attributes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {variants.map((v, index) => {
              const isSelected = selectedIndices.includes(index)
              const isExpanded = expandedIndices.includes(index)

              return (
                <React.Fragment key={index}>
                  <ProductVariantRow
                    index={index}
                    variant={v}
                    isSelected={isSelected}
                    isExpanded={isExpanded}
                    onSelect={(checked) => onSelectVariant(index, checked)}
                    onToggleExpand={() => onToggleExpand(index)}
                    onImageChange={(url) => onUpdateVariantField(index, "image", url)}
                    onSkuChange={(sku) => onUpdateVariantField(index, "sku", sku)}
                    onPriceChange={(price) => onUpdateVariantField(index, "price", price)}
                    onQuantityChange={(qty) => onUpdateVariantField(index, "quantity", qty)}
                  />

                  {isExpanded && (
                    <ProductVariantSpecsRow
                      variantIndex={index}
                      title={v.title}
                      attributes={v.attributes as VariantAttribute[]}
                      onAddAttribute={onAddVariantAttribute}
                      onUpdateAttribute={onUpdateVariantAttribute}
                      onRemoveAttribute={onRemoveVariantAttribute}
                      onCopyAttributesToSelected={onCopyAttributesToSelected}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
