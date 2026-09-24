import React, { useState, useEffect } from "react"
import { Edit3, DollarSign, Package } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/core/components/shadcn/dialog"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import PriceInput from "~/shared/components/PriceInput"

export interface BulkEditVariantsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  onApply: (data: { price?: number; stock?: number }) => void
}

export default function BulkEditVariantsDialog({
  open,
  onOpenChange,
  selectedCount,
  onApply
}: BulkEditVariantsDialogProps) {
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")

  // Reset inputs when dialog opens
  useEffect(() => {
    if (open) {
      setPrice("")
      setStock("")
    }
  }, [open])

  const parsedPrice = price.trim() !== "" ? parseFloat(price) : undefined
  const parsedStock = stock.trim() !== "" ? parseInt(stock, 10) : undefined

  const isPriceValid = parsedPrice === undefined || (!isNaN(parsedPrice) && parsedPrice >= 0)
  const isStockValid = parsedStock === undefined || (!isNaN(parsedStock) && parsedStock >= 0)
  const hasValidChange =
    (parsedPrice !== undefined || parsedStock !== undefined) &&
    isPriceValid &&
    isStockValid

  const handleApply = () => {
    if (!hasValidChange) return

    onApply({
      price: parsedPrice,
      stock: parsedStock
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Edit3 className="size-4" />
            </div>
            Bulk Edit Variants
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update pricing and inventory across the{" "}
            <span className="font-semibold text-foreground">
              {selectedCount} selected variant{selectedCount > 1 ? "s" : ""}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Price Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <DollarSign className="size-3.5 text-emerald-600" />
                Price ($)
              </label>
              <span className="text-[11px] text-muted-foreground">
                Leave empty to keep current
              </span>
            </div>
            <PriceInput
              placeholder="0.00"
              value={price ? parseFloat(price) : ""}
              onChange={(val) => setPrice(val ? String(val) : "")}
              className="h-9 text-xs bg-gray-50/50 dark:bg-zinc-800/50"
            />
          </div>

          {/* Available Stock Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Package className="size-3.5 text-blue-600" />
                Available Stock
              </label>
              <span className="text-[11px] text-muted-foreground">
                Leave empty to keep current
              </span>
            </div>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="h-9 text-xs bg-gray-50/50 dark:bg-zinc-800/50"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!hasValidChange}
            onClick={handleApply}
            className="text-xs"
          >
            Apply to {selectedCount} variant{selectedCount > 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
