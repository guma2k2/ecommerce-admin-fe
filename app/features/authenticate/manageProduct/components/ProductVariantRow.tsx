import React from "react"
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Input } from "~/core/components/shadcn/input"
import FileUpload from "~/shared/components/FileUpload"
import PriceInput from "~/shared/components/PriceInput"
import { cn } from "~/shared/utils/appUtils"
import type { VariantAttribute } from "./ProductVariantSpecsRow"

export interface VariantRowItem {
  id?: number | null
  title?: string
  sku?: string
  price: number
  quantity: number
  image?: string
  mediaId?: string
  attributes?: VariantAttribute[]
}

export interface ProductVariantRowProps {
  index: number
  variant: VariantRowItem
  isSelected: boolean
  isExpanded: boolean
  onSelect: (checked: boolean) => void
  onToggleExpand: () => void
  onImageChange: (url: string) => void
  onSkuChange: (sku: string) => void
  onPriceChange: (price: number) => void
  onQuantityChange: (quantity: number) => void
}

export default function ProductVariantRow({
  index,
  variant,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onImageChange,
  onSkuChange,
  onPriceChange,
  onQuantityChange
}: ProductVariantRowProps) {
  const attrCount = variant.attributes?.filter((a) => a.value?.trim())?.length || 0
  const hasAttrs = (variant.attributes?.length || 0) > 0

  return (
    <tr
      className={cn(
        "hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors",
        isSelected && "bg-primary/5",
        isExpanded && "border-b-transparent bg-gray-50/30 dark:bg-zinc-800/20"
      )}
    >
      <td className="py-2.5 px-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(!!checked)}
        />
      </td>
      <td className="py-2 px-3">
        <div className="w-10 h-10 rounded border overflow-hidden bg-gray-50 dark:bg-zinc-800">
          <FileUpload
            variant="compact"
            value={variant.image || ""}
            onChange={onImageChange}
          />
        </div>
      </td>
      <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-gray-100">
        {variant.title || `Variant ${index + 1}`}
        {variant.id && (
          <span className="ml-1.5 text-[10px] text-muted-foreground font-mono">
            #id:{variant.id}
          </span>
        )}
      </td>
      <td className="py-2 px-3">
        <Input
          value={variant.sku || ""}
          onChange={(e) => onSkuChange(e.target.value)}
          className="h-8 font-mono text-xs bg-transparent"
        />
      </td>
      <td className="py-2 px-3">
        <PriceInput
          value={variant.price ?? 0}
          onChange={onPriceChange}
          placeholder="0.00"
          className="h-8 text-xs bg-transparent font-medium"
        />
      </td>
      <td className="py-2 px-3">
        <Input
          type="number"
          min="0"
          value={variant.quantity ?? 0}
          onChange={(e) => onQuantityChange(parseInt(e.target.value, 10) || 0)}
          className="h-8 text-xs bg-transparent"
        />
      </td>
      <td className="py-2 px-3 text-right">
        <button
          type="button"
          onClick={onToggleExpand}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all select-none",
            hasAttrs
              ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
              : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700"
          )}
        >
          <SlidersHorizontal className="size-3 text-indigo-500" />
          <span>{attrCount > 0 ? `${attrCount} Specs` : "Specs"}</span>
          {isExpanded ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3 opacity-60" />
          )}
        </button>
      </td>
    </tr>
  )
}
