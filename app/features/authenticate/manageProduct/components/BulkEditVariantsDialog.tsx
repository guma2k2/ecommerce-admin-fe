import React, { useState, useEffect } from "react"
import { useTranslation, Trans } from "react-i18next"
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
  const { t } = useTranslation()
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
          <DialogTitle className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Edit3 className="size-4" />
            </div>
            {t("product.variants.bulkEditTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            <Trans
              i18nKey="product.variants.bulkEditDesc"
              values={{ count: selectedCount }}
              components={{
                1: <span className="font-semibold text-foreground" />
              }}
            />
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Price Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <DollarSign className="size-3.5 text-emerald-600" />
                {t("product.variants.price")}
              </label>
              <span className="text-xs text-muted-foreground">
                {t("product.variants.leaveEmptyToKeep")}
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
                {t("product.variants.stock")}
              </label>
              <span className="text-xs text-muted-foreground">
                {t("product.variants.leaveEmptyToKeep")}
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
            {t("button.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!hasValidChange}
            onClick={handleApply}
            className="text-xs"
          >
            {t("product.variants.applyToCount", { count: selectedCount })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
