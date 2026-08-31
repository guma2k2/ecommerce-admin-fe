import { Tag, Copy, Plus, Trash2 } from "lucide-react"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import { Badge } from "~/core/components/shadcn/badge"
import InfiniteSelect from "~/shared/components/InfiniteSelect"
import { getProductAttributes } from "~/shared/services/api/productAttributeService"
import type { ProductAttributeItem } from "~/shared/types"

export interface VariantAttribute {
  productAttributeId: number
  name?: string
  value: string
}

export interface ProductVariantSpecsRowProps {
  variantIndex: number
  title?: string
  attributes?: VariantAttribute[]
  onAddAttribute: (variantIndex: number) => void
  onUpdateAttribute: (
    variantIndex: number,
    attrIndex: number,
    field: "productAttributeId" | "name" | "value",
    val: any
  ) => void
  onRemoveAttribute: (variantIndex: number, attrIndex: number) => void
  onCopyAttributesToSelected: (sourceVariantIndex: number) => void
}

export default function ProductVariantSpecsRow({
  variantIndex,
  title,
  attributes = [],
  onAddAttribute,
  onUpdateAttribute,
  onRemoveAttribute,
  onCopyAttributesToSelected
}: ProductVariantSpecsRowProps) {
  const attrCount = attributes.filter((a) => a.value?.trim())?.length || 0

  return (
    <tr className="bg-gray-50/70 dark:bg-zinc-900/60 border-b border-gray-200 dark:border-zinc-800">
      <td colSpan={7} className="p-3.5 pl-12">
        <div className="rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-indigo-500" />
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                Specifications for {title || `Variant ${variantIndex + 1}`}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                {attrCount} configured
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {attrCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyAttributesToSelected(variantIndex)}
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                  title="Copy these specifications to other variants"
                >
                  <Copy className="size-3" />
                  Copy to other variants
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddAttribute(variantIndex)}
                className="h-7 px-2.5 text-xs gap-1 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900"
              >
                <Plus className="size-3.5" />
                Add Attribute
              </Button>
            </div>
          </div>

          {attributes.length === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              No variant-specific attributes added yet (e.g. Weight, Dimensions, GTIN, RAM, Material).
              <button
                type="button"
                onClick={() => onAddAttribute(variantIndex)}
                className="ml-1 text-primary hover:underline font-medium"
              >
                Click to add
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {attributes.map((attr, attrIdx) => (
                <div
                  key={attrIdx}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50/60 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800"
                >
                  <div className="w-1/3 min-w-[180px]">
                    <InfiniteSelect<ProductAttributeItem>
                      fetchData={getProductAttributes}
                      value={attr.name || ""}
                      onChange={(val, item) => {
                        const numId = item
                          ? typeof item.id === 'number'
                            ? item.id
                            : parseInt(String(item.id).replace(/\D/g, ""), 10) || 101
                          : 101
                        onUpdateAttribute(variantIndex, attrIdx, "name", val)
                        onUpdateAttribute(variantIndex, attrIdx, "productAttributeId", numId)
                      }}
                      getOptionValue={(item) => item.name}
                      getOptionLabel={(item) => item.name}
                      placeholder="Select attribute..."
                      searchPlaceholder="Search attribute..."
                      triggerClassName="h-8 text-xs bg-white dark:bg-zinc-900"
                      renderOption={(item) => (
                        <div className="flex items-center justify-between w-full pr-2">
                          <span className="font-medium truncate">{item.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground ml-2">
                            {item.id}
                          </span>
                        </div>
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Input
                      value={attr.value || ""}
                      onChange={(e) =>
                        onUpdateAttribute(variantIndex, attrIdx, "value", e.target.value)
                      }
                      placeholder="Value (e.g. 180g, 15x8cm, Waterproof)"
                      className="h-8 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveAttribute(variantIndex, attrIdx)}
                    className="size-8 text-gray-400 hover:text-red-500 shrink-0"
                    title="Remove specification"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
