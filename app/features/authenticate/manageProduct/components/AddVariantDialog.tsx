import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Tag, Layers, AlertCircle } from "lucide-react"
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
import FileUpload from "~/shared/components/FileUpload"
import PriceInput from "~/shared/components/PriceInput"
import type { ProductOptionForm } from "~/features/authenticate/manageProduct/validator"
import { getCombinationSignature } from "~/features/authenticate/manageProduct/helpers"

export interface OptionSelection {
  optionId?: number | string | null
  optionName: string
  value: string
}

export interface NewVariantData {
  optionSelections: OptionSelection[]
  price: number
  quantity: number
  image?: string
  mediaId?: string
}

export interface AddVariantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: ProductOptionForm[]
  existingSignatures: Set<string>
  defaultPrice?: number
  defaultQuantity?: number
  onSaveVariant: (data: NewVariantData) => void
}

export default function AddVariantDialog({
  open,
  onOpenChange,
  options,
  existingSignatures,
  defaultPrice = 0,
  defaultQuantity = 0,
  onSaveVariant
}: AddVariantDialogProps) {
  const { t } = useTranslation()
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({})
  const [price, setPrice] = useState<number>(defaultPrice)
  const [quantity, setQuantity] = useState<number>(defaultQuantity)
  const [image, setImage] = useState<string>("")
  const [mediaId, setMediaId] = useState<string | undefined>(undefined)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Filter valid options with non-empty names
  const validOptions = options.filter((opt) => opt.name?.trim())

  // Reset form when opened
  useEffect(() => {
    if (open) {
      const initialMap: Record<string, string> = {}
      validOptions.forEach((opt) => {
        // Pre-fill with first value if available
        const firstVal = opt.values?.find((v) => v.value?.trim())?.value || ""
        initialMap[opt.name.trim()] = firstVal
      })
      setSelectedValues(initialMap)
      setPrice(defaultPrice)
      setQuantity(defaultQuantity)
      setImage("")
      setMediaId(undefined)
      setErrorMsg(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultPrice, defaultQuantity])

  const handleOptionValueChange = (optionName: string, val: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [optionName]: val
    }))
    setErrorMsg(null)
  }

  const handleSave = () => {
    // 1. Validate that every option has a value
    for (const opt of validOptions) {
      const val = (selectedValues[opt.name.trim()] || "").trim()
      if (!val) {
        setErrorMsg(`Please specify a value for "${opt.name.trim()}".`)
        return
      }
    }

    // 2. Build selection array
    const optionSelections: OptionSelection[] = validOptions.map((opt) => {
      const optName = opt.name.trim()
      return {
        optionId: opt.productOptionId ?? opt.id ?? null,
        optionName: optName,
        value: selectedValues[optName].trim()
      }
    })

    // 3. Check for duplicate variant combination
    const sig = getCombinationSignature(optionSelections)
    if (existingSignatures.has(sig)) {
      setErrorMsg("A variant with this exact combination already exists.")
      return
    }

    // 4. Submit
    onSaveVariant({
      optionSelections,
      price: Number(price) || 0,
      quantity: Number(quantity) || 0,
      image,
      mediaId
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="size-4" />
            </div>
            {t("product.variants.addVariantTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("product.variants.variantAttrsDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Top Section: Media Upload & Details Card */}
          <div className="p-4 rounded-xl bg-gray-50/70 dark:bg-zinc-800/40 border border-gray-200/80 dark:border-zinc-800 flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900 shrink-0 flex items-center justify-center">
              <FileUpload
                variant="compact"
                mediaDialog={true}
                value={image}
                onChange={(url, id) => {
                  setImage(url)
                  setMediaId(id)
                }}
              />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                <Layers className="size-3.5 text-primary" />
                <span>{t("product.variants.variantAttributes")}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("product.variants.variantAttrsDesc")}
              </p>
            </div>
          </div>

          {/* Dynamic Option Inputs (Color, Size, etc.) */}
          <div className="space-y-3.5">
            {validOptions.map((opt) => {
              const optName = opt.name.trim()
              const currentVal = selectedValues[optName] || ""
              const existingValues = (opt.values || [])
                .map((v) => v.value?.trim())
                .filter((v): v is string => Boolean(v))

              return (
                <div key={String(opt.id || opt.productOptionId || optName)} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Tag className="size-3.5 text-indigo-500" />
                      {optName} *
                    </label>
                  </div>

                  {/* Input with Quick Value Chips */}
                  <div className="space-y-2">
                    <Input
                      placeholder={`Add ${optName.toLowerCase()} (e.g. ${existingValues[0] || "Custom"})...`}
                      value={currentVal}
                      onChange={(e) => handleOptionValueChange(optName, e.target.value)}
                      className="h-9 text-xs bg-white dark:bg-zinc-900"
                    />

                    {/* Chips for existing values to quickly select */}
                    {existingValues.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-2xs text-muted-foreground mr-1">{t("product.variants.suggestions")}</span>
                        {existingValues.map((v) => {
                          const isSelected = currentVal.toLowerCase() === v.toLowerCase()
                          return (
                            <button
                              type="button"
                              key={v}
                              onClick={() => handleOptionValueChange(optName, v)}
                              className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700"
                              }`}
                            >
                              {v}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pricing & Stock Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-100 dark:border-zinc-800">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t("product.variants.price")}
              </label>
              <PriceInput
                value={price}
                onChange={(val) => setPrice(Number(val) || 0)}
                placeholder="0.00"
                className="h-9 text-xs bg-white dark:bg-zinc-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {t("product.variants.stock")}
              </label>
              <Input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="h-9 text-xs bg-white dark:bg-zinc-900"
              />
            </div>
          </div>

          {/* Inline Error Display */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
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
            onClick={handleSave}
            className="text-xs"
          >
            {t("product.variants.saveVariant")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
