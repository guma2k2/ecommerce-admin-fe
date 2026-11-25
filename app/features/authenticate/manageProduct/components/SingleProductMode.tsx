import React from "react"
import { useTranslation } from "react-i18next"
import { DollarSign, Package } from "lucide-react"
import { Input, Label } from "~/core/components/shadcn"
import PriceInput from "~/shared/components/PriceInput"

export interface SingleProductModeProps {
  price: number
  quantity: number
  onPriceChange: (value: number) => void
  onQuantityChange: (value: number) => void
}

export default function SingleProductMode({
  price,
  quantity,
  onPriceChange,
  onQuantityChange
}: SingleProductModeProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
      <div className="space-y-1.5">
        <Label variant="field" className="gap-1">
          <DollarSign className="size-3.5 text-emerald-600" />
          {t("product.variants.price")}
        </Label>
        <PriceInput
          value={price ? price : ""}
          onChange={onPriceChange}
          placeholder="0.00"
          className="bg-gray-50/50 dark:bg-zinc-800/50 font-medium"
        />
      </div>

      <div className="space-y-1.5">
        <Label variant="field" className="gap-1">
          <Package className="size-3.5 text-blue-600" />
          {t("product.variants.stock")}
        </Label>
        <Input
          type="number"
          min="0"
          placeholder="0"
          value={quantity ? quantity : ""}
          onChange={(e) => onQuantityChange(parseInt(e.target.value, 10) || 0)}
          className="bg-gray-50/50 dark:bg-zinc-800/50"
        />
      </div>
    </div>
  )
}
