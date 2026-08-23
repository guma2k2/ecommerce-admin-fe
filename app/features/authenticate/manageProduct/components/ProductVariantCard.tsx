import React, { useEffect, useState } from "react"
import { useFormContext, useFieldArray, useWatch } from "react-hook-form"
import {
  Layers,
  Plus,
  Trash2,
  SlidersHorizontal,
  DollarSign,
  Package,
  Wand2,
  GripVertical,
  X
} from "lucide-react"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Badge } from "~/core/components/shadcn/badge"
import { FormInput } from "~/shared/components/Form"
import FileUpload from "~/shared/components/FileUpload"
import { cartesian, cn } from "~/shared/utils/appUtils"
import type { ProductFormSchema } from "~/features/authenticate/manageProduct/validator"

export default function ProductVariantCard() {
  const { control, setValue, getValues } = useFormContext<ProductFormSchema>()
  const hasOptions = useWatch({ control, name: "hasOptions" })
  const options = useWatch({ control, name: "options" }) || []
  const variants = useWatch({ control, name: "variants" }) || []
  const productSlug = useWatch({ control, name: "slug" }) || "PROD"

  const [selectedVariantIndices, setSelectedVariantIndices] = useState<number[]>([])
  const [bulkPrice, setBulkPrice] = useState("")
  const [bulkStock, setBulkStock] = useState("")
  const [newOptionValueInputs, setNewOptionValueInputs] = useState<Record<number, string>>({})

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption
  } = useFieldArray({
    control,
    name: "options"
  })

  // Synchronize variants when options change in multi-variant mode
  useEffect(() => {
    if (!hasOptions) {
      // In single mode, ensure 1 default variant is present
      const simplePrice = Number(getValues("simplePrice")) || 0
      const simpleQuantity = Number(getValues("simpleQuantity")) || 0
      const simpleSku = getValues("simpleSku") || `${productSlug.toUpperCase()}-DEF`
      const existingId = variants[0]?.id || null

      setValue("variants", [
        {
          id: existingId,
          title: "Default Variant",
          sku: simpleSku,
          price: simplePrice,
          quantity: simpleQuantity,
          image: variants[0]?.image || "",
          mediaId: variants[0]?.mediaId || undefined
        }
      ], { shouldValidate: true })
      return
    }

    // Filter valid options with at least one non-empty value
    const validOptions = options.filter(
      (opt) => opt.name.trim() && opt.values && opt.values.some((v) => v.value.trim())
    )

    if (validOptions.length === 0) {
      if (variants.length === 0) {
        setValue("variants", [
          {
            id: null,
            title: "Default",
            sku: `${productSlug.toUpperCase()}-001`,
            price: Number(getValues("simplePrice")) || 0,
            quantity: Number(getValues("simpleQuantity")) || 0
          }
        ])
      }
      return
    }

    const valueMatrix = validOptions.map((opt) =>
      opt.values.filter((v) => v.value.trim()).map((v) => ({
        optionName: opt.name,
        value: v.value.trim(),
        optionValueId: v.id || null
      }))
    )

    const combinations = cartesian(valueMatrix)
    const currentVariants = getValues("variants") || []

    const newVariants = combinations.map((combo, idx) => {
      const comboTitle = combo.map((c) => c.value).join(" / ")
      const matchingExisting = currentVariants.find(
        (v) => v.title?.toLowerCase() === comboTitle.toLowerCase()
      )

      // Generate clean default SKU
      const skuSuffix = combo
        .map((c) => c.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase())
        .join("-")
      const fallbackSku = `${productSlug.toUpperCase().slice(0, 8)}-${skuSuffix || idx + 1}`

      return {
        id: matchingExisting?.id || null,
        title: comboTitle,
        sku: matchingExisting?.sku || fallbackSku,
        price: matchingExisting ? Number(matchingExisting.price) : Number(getValues("simplePrice")) || 0,
        quantity: matchingExisting ? Number(matchingExisting.quantity) : Number(getValues("simpleQuantity")) || 0,
        image: matchingExisting?.image || "",
        mediaId: matchingExisting?.mediaId || undefined,
        productOptionValueIds: combo
          .map((c) => c.optionValueId)
          .filter((id): id is number => typeof id === "number")
      }
    })

    setValue("variants", newVariants, { shouldValidate: true })
  }, [hasOptions, JSON.stringify(options)])

  // Add a new option axis (e.g. Size, Color)
  const handleAddOption = () => {
    const nextPosition = optionFields.length
    appendOption({
      name: nextPosition === 0 ? "Color" : nextPosition === 1 ? "Size" : `Option ${nextPosition + 1}`,
      position: nextPosition,
      showing: true,
      values: [{ id: null, value: "", position: 0 }]
    })
  }

  // Add value chip to an option
  const handleAddValueToOption = (optionIndex: number) => {
    const text = (newOptionValueInputs[optionIndex] || "").trim()
    if (!text) return

    const currentOptions = [...(getValues("options") || [])]
    const target = currentOptions[optionIndex]
    if (target) {
      const existingValues = target.values || []
      if (!existingValues.some((v) => v.value.toLowerCase() === text.toLowerCase())) {
        target.values = [
          ...existingValues.filter((v) => v.value.trim()),
          { id: null, value: text, position: existingValues.length }
        ]
        setValue("options", currentOptions, { shouldDirty: true })
      }
    }

    setNewOptionValueInputs((prev) => ({ ...prev, [optionIndex]: "" }))
  }

  // Remove value chip
  const handleRemoveValue = (optionIndex: number, valueIndex: number) => {
    const currentOptions = [...(getValues("options") || [])]
    const target = currentOptions[optionIndex]
    if (target && target.values) {
      target.values = target.values.filter((_, idx) => idx !== valueIndex)
      setValue("options", currentOptions, { shouldDirty: true })
    }
  }

  // Bulk Edit Actions
  const handleSelectAllVariants = (checked: boolean) => {
    if (checked) {
      setSelectedVariantIndices(variants.map((_, i) => i))
    } else {
      setSelectedVariantIndices([])
    }
  }

  const handleApplyBulkPrice = () => {
    const p = parseFloat(bulkPrice)
    if (isNaN(p) || p < 0) return
    const current = [...(getValues("variants") || [])]
    const targets = selectedVariantIndices.length > 0 ? selectedVariantIndices : current.map((_, i) => i)
    targets.forEach((i) => {
      if (current[i]) current[i].price = p
    })
    setValue("variants", current, { shouldDirty: true })
    setBulkPrice("")
  }

  const handleApplyBulkStock = () => {
    const q = parseInt(bulkStock, 10)
    if (isNaN(q) || q < 0) return
    const current = [...(getValues("variants") || [])]
    const targets = selectedVariantIndices.length > 0 ? selectedVariantIndices : current.map((_, i) => i)
    targets.forEach((i) => {
      if (current[i]) current[i].quantity = q
    })
    setValue("variants", current, { shouldDirty: true })
    setBulkStock("")
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 space-y-6 shadow-xs">
      {/* Header & Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            Pricing & Variants
          </h3>
          <p className="text-xs text-muted-foreground">
            Configure standalone product pricing or multiple variant combinations (Size, Color, etc.).
          </p>
        </div>

        {/* Toggle Switch for Multi-variant */}
        <label className="flex items-center gap-2.5 cursor-pointer bg-gray-50 dark:bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs font-medium">
          <Checkbox
            checked={hasOptions}
            onCheckedChange={(checked) => setValue("hasOptions", !!checked, { shouldDirty: true })}
          />
          <span>Multiple variations (Size, Color, etc.)</span>
        </label>
      </div>

      {/* SINGLE PRODUCT MODE */}
      {!hasOptions ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <DollarSign className="size-3.5 text-emerald-600" />
              Price ($) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={variants[0]?.price ?? 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0
                setValue("simplePrice", val)
                setValue("variants.0.price", val, { shouldDirty: true })
              }}
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
              value={variants[0]?.quantity ?? 0}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0
                setValue("simpleQuantity", val)
                setValue("variants.0.quantity", val, { shouldDirty: true })
              }}
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
              value={variants[0]?.sku ?? ""}
              onChange={(e) => {
                setValue("simpleSku", e.target.value)
                setValue("variants.0.sku", e.target.value, { shouldDirty: true })
              }}
              className="bg-gray-50/50 dark:bg-zinc-800/50 font-mono text-xs"
            />
          </div>
        </div>
      ) : (
        /* MULTI-VARIANT MODE */
        <div className="space-y-6">
          {/* Options Axes Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Variation Axes (Options)
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="h-7 text-xs gap-1 border-dashed"
              >
                <Plus className="size-3" />
                Add Option Axis
              </Button>
            </div>

            {optionFields.map((field, optIdx) => (
              <div
                key={field.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/40 dark:bg-zinc-800/30 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="size-4 text-gray-400 cursor-grab" />
                  <div className="w-48">
                    <Input
                      placeholder="Option Name (e.g. Color)"
                      value={options[optIdx]?.name || ""}
                      onChange={(e) => {
                        setValue(`options.${optIdx}.name`, e.target.value, { shouldDirty: true })
                      }}
                      className="h-8 bg-white dark:bg-zinc-900 text-xs font-medium"
                    />
                  </div>
                  <div className="flex-1 text-xs text-muted-foreground">
                    Values: {options[optIdx]?.values?.filter((v) => v.value.trim()).length || 0}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(optIdx)}
                    className="h-7 w-7 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                {/* Values Chip List */}
                <div className="flex flex-wrap items-center gap-2 pl-7">
                  {options[optIdx]?.values
                    ?.filter((v) => v.value.trim())
                    .map((val, valIdx) => (
                      <Badge
                        key={valIdx}
                        variant="secondary"
                        className="pl-2.5 pr-1.5 py-1 text-xs font-medium gap-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-2xs"
                      >
                        {val.value}
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(optIdx, valIdx)}
                          className="hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full p-0.5"
                        >
                          <X className="size-3 text-gray-400 hover:text-red-500" />
                        </button>
                      </Badge>
                    ))}

                  {/* Add Value Input */}
                  <div className="flex items-center gap-1.5">
                    <Input
                      placeholder="Type value (e.g. Red) & press Add"
                      value={newOptionValueInputs[optIdx] || ""}
                      onChange={(e) =>
                        setNewOptionValueInputs((prev) => ({ ...prev, [optIdx]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddValueToOption(optIdx)
                        }
                      }}
                      className="h-7 w-48 bg-white dark:bg-zinc-900 text-xs"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddValueToOption(optIdx)}
                      className="h-7 px-2.5 text-xs"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Variants Matrix Table */}
          {variants.length > 0 && (
            <div className="space-y-3 pt-2">
              {/* Bulk Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      variants.length > 0 && selectedVariantIndices.length === variants.length
                    }
                    onCheckedChange={(c) => handleSelectAllVariants(!!c)}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {selectedVariantIndices.length > 0
                      ? `${selectedVariantIndices.length} of ${variants.length} selected`
                      : `Total ${variants.length} SKU(s)`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      placeholder="Bulk Price ($)"
                      value={bulkPrice}
                      onChange={(e) => setBulkPrice(e.target.value)}
                      className="h-7 w-28 bg-white dark:bg-zinc-900 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyBulkPrice}
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
                      onClick={handleApplyBulkStock}
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
                      <th className="py-2.5 px-3 min-w-[160px]">SKU *</th>
                      <th className="py-2.5 px-3 w-32">Price ($) *</th>
                      <th className="py-2.5 px-3 w-28">Available *</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {variants.map((v, index) => {
                      const isSelected = selectedVariantIndices.includes(index)
                      return (
                        <tr
                          key={index}
                          className={cn(
                            "hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors",
                            isSelected && "bg-primary/5"
                          )}
                        >
                          <td className="py-2.5 px-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                setSelectedVariantIndices((prev) =>
                                  checked ? [...prev, index] : prev.filter((i) => i !== index)
                                )
                              }}
                            />
                          </td>
                          <td className="py-2 px-3">
                            <div className="w-10 h-10 rounded border overflow-hidden bg-gray-50 dark:bg-zinc-800">
                              <FileUpload
                                variant="compact"
                                value={v.image || ""}
                                onChange={(url: string) => {
                                  setValue(`variants.${index}.image`, url, { shouldDirty: true })
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-gray-100">
                            {v.title || `Variant ${index + 1}`}
                            {v.id && (
                              <span className="ml-1.5 text-[10px] text-muted-foreground font-mono">
                                #id:{v.id}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              value={v.sku || ""}
                              onChange={(e) => {
                                setValue(`variants.${index}.sku`, e.target.value, {
                                  shouldDirty: true
                                })
                              }}
                              className="h-8 font-mono text-xs bg-transparent"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={v.price ?? 0}
                              onChange={(e) => {
                                setValue(
                                  `variants.${index}.price`,
                                  parseFloat(e.target.value) || 0,
                                  { shouldDirty: true }
                                )
                              }}
                              className="h-8 text-xs bg-transparent font-medium"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              type="number"
                              min="0"
                              value={v.quantity ?? 0}
                              onChange={(e) => {
                                setValue(
                                  `variants.${index}.quantity`,
                                  parseInt(e.target.value, 10) || 0,
                                  { shouldDirty: true }
                                )
                              }}
                              className="h-8 text-xs bg-transparent"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
