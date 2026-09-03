import React, { useEffect, useState } from "react"
import { useFormContext, useFieldArray, useWatch } from "react-hook-form"
import type { DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { Layers } from "lucide-react"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { cartesian } from "~/shared/utils/appUtils"
import type { ProductFormSchema } from "~/features/authenticate/manageProduct/validator"
import SingleProductMode from "./SingleProductMode"
import ProductOptionSection from "./ProductOptionSection"
import ProductVariantsMatrixTable from "./ProductVariantsMatrixTable"

export default function ProductVariantCard() {
  const { control, setValue, getValues } = useFormContext<ProductFormSchema>()
  const hasOptions = useWatch({ control, name: "hasOptions" })
  const options = useWatch({ control, name: "options" }) || []
  const variants = useWatch({ control, name: "variants" }) || []
  const productSlug = useWatch({ control, name: "slug" }) || "PROD"

  const [selectedVariantIndices, setSelectedVariantIndices] = useState<number[]>([])
  const [expandedVariantIndices, setExpandedVariantIndices] = useState<number[]>([])

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
    move: moveOption
  } = useFieldArray({
    control,
    name: "options"
  })

  const optionsJson = JSON.stringify(options)

  // Synchronize variants when options change in multi-variant mode
  useEffect(() => {
    if (!hasOptions) {
      // In single mode, ensure 1 default variant is present
      const simplePrice = Number(getValues("simplePrice")) || 0
      const simpleQuantity = Number(getValues("simpleQuantity")) || 0
      const simpleSku = getValues("simpleSku") || `${productSlug.toUpperCase()}-DEF`
      const existingId = variants[0]?.id || null

      setValue(
        "variants",
        [
          {
            id: existingId,
            title: "Default Variant",
            sku: simpleSku,
            price: simplePrice,
            quantity: simpleQuantity,
            image: variants[0]?.image || "",
            mediaId: variants[0]?.mediaId || undefined
          }
        ],
        { shouldValidate: true }
      )
      return
    }

    // Filter valid options with at least one non-empty value
    const validOptions = options.filter(
      (opt) => opt.name?.trim() && opt.values && opt.values.some((v) => v.value?.trim())
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
      opt.values
        .filter((v) => v.value?.trim())
        .map((v) => ({
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
          .filter((id): id is number => typeof id === "number"),
        attributes: matchingExisting?.attributes || []
      }
    })

    setValue("variants", newVariants, { shouldValidate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasOptions, optionsJson])

  // Single Product Mode Handlers
  const handleSinglePriceChange = (val: number) => {
    setValue("simplePrice", val)
    setValue("variants.0.price", val, { shouldDirty: true })
  }

  const handleSingleQuantityChange = (val: number) => {
    setValue("simpleQuantity", val)
    setValue("variants.0.quantity", val, { shouldDirty: true })
  }

  const handleSingleSkuChange = (val: string) => {
    setValue("simpleSku", val)
    setValue("variants.0.sku", val, { shouldDirty: true })
  }

  // Multi-variant Option Axis Handlers
  const handleAddOption = () => {
    const nextPosition = optionFields.length
    appendOption({
      name: "",
      position: nextPosition,
      showing: true,
      values: []
    })
  }

  const handleRemoveOption = (optionIndex: number) => {
    removeOption(optionIndex)
  }

  const handleUpdateOptionName = (optionIndex: number, name: string) => {
    setValue(`options.${optionIndex}.name`, name, { shouldDirty: true })
  }

  const handleAddValue = (optionIndex: number, valueText: string) => {
    const trimmed = valueText.trim()
    if (!trimmed) return

    const currentOptions = [...(getValues("options") || [])]
    const target = currentOptions[optionIndex]
    if (target) {
      const existingValues = target.values || []
      if (!existingValues.some((v) => v.value.toLowerCase() === trimmed.toLowerCase())) {
        const nextPos = existingValues.length
        currentOptions[optionIndex] = {
          ...target,
          values: [
            ...existingValues.filter((v) => v.value.trim()),
            { id: null, value: trimmed, position: nextPos }
          ]
        }
        setValue("options", currentOptions, { shouldDirty: true })
      }
    }
  }

  const handleUpdateValue = (optionIndex: number, valueIndex: number, newValue: string) => {
    const currentOptions = [...(getValues("options") || [])]
    const target = currentOptions[optionIndex]
    if (target && target.values && target.values[valueIndex]) {
      target.values[valueIndex] = {
        ...target.values[valueIndex],
        value: newValue
      }
      setValue("options", currentOptions, { shouldDirty: true })
    }
  }

  const handleRemoveValue = (optionIndex: number, valueIndex: number) => {
    const currentOptions = [...(getValues("options") || [])]
    const target = currentOptions[optionIndex]
    if (target && target.values) {
      const remaining = target.values
        .filter((_, idx) => idx !== valueIndex)
        .map((v, i) => ({ ...v, position: i }))
      currentOptions[optionIndex] = {
        ...target,
        values: remaining
      }
      setValue("options", currentOptions, { shouldDirty: true })
    }
  }

  const handleReorderValues = (optionIndex: number, oldIndex: number, newIndex: number) => {
    const currentOptions = [...(getValues("options") || [])]
    const target = currentOptions[optionIndex]
    if (target && target.values) {
      const reordered = arrayMove(target.values, oldIndex, newIndex).map((v, i) => ({
        ...v,
        position: i
      }))
      currentOptions[optionIndex] = {
        ...target,
        values: reordered
      }
      setValue("options", currentOptions, { shouldDirty: true })
    }
  }

  const handleToggleShowing = (optionIndex: number, showing: boolean) => {
    setValue(`options.${optionIndex}.showing`, showing, { shouldDirty: true })
  }

  const handleDragEndOption = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = optionFields.findIndex((f) => f.id === active.id)
    const newIndex = optionFields.findIndex((f) => f.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      moveOption(oldIndex, newIndex)
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

  const handleSelectVariant = (index: number, checked: boolean) => {
    setSelectedVariantIndices((prev) =>
      checked ? [...prev, index] : prev.filter((i) => i !== index)
    )
  }

  const handleApplyBulkPrice = (price: number) => {
    const current = [...(getValues("variants") || [])]
    const targets = selectedVariantIndices.length > 0 ? selectedVariantIndices : current.map((_, i) => i)
    targets.forEach((i) => {
      if (current[i]) current[i].price = price
    })
    setValue("variants", current, { shouldDirty: true })
  }

  const handleApplyBulkStock = (quantity: number) => {
    const current = [...(getValues("variants") || [])]
    const targets = selectedVariantIndices.length > 0 ? selectedVariantIndices : current.map((_, i) => i)
    targets.forEach((i) => {
      if (current[i]) current[i].quantity = quantity
    })
    setValue("variants", current, { shouldDirty: true })
  }

  // Variant Matrix Field Changes
  const handleUpdateVariantField = (index: number, field: string, value: string | number | null) => {
    const currentVariants = [...(getValues("variants") || [])]
    if (currentVariants[index]) {
      currentVariants[index] = {
        ...currentVariants[index],
        [field]: value
      }
      setValue("variants", currentVariants, { shouldDirty: true })
    }
  }

  // Variant-level attribute handlers
  const toggleExpandVariant = (index: number) => {
    setExpandedVariantIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const handleAddVariantAttribute = (variantIndex: number) => {
    const currentVariants = [...(getValues("variants") || [])]
    const target = currentVariants[variantIndex]
    if (target) {
      const existingAttrs = target.attributes || []
      currentVariants[variantIndex] = {
        ...target,
        attributes: [
          ...existingAttrs,
          { productAttributeId: 101, name: "", value: "" }
        ]
      }
      setValue("variants", currentVariants, { shouldDirty: true })
      if (!expandedVariantIndices.includes(variantIndex)) {
        setExpandedVariantIndices((prev) => [...prev, variantIndex])
      }
    }
  }

  const handleUpdateVariantAttribute = (
    variantIndex: number,
    attrIndex: number,
    field: "productAttributeId" | "name" | "value",
    val: string | number
  ) => {
    const currentVariants = [...(getValues("variants") || [])]
    const target = currentVariants[variantIndex]
    if (target && target.attributes && target.attributes[attrIndex]) {
      target.attributes[attrIndex] = {
        ...target.attributes[attrIndex],
        [field]: val
      }
      setValue("variants", currentVariants, { shouldDirty: true })
    }
  }

  const handleRemoveVariantAttribute = (variantIndex: number, attrIndex: number) => {
    const currentVariants = [...(getValues("variants") || [])]
    const target = currentVariants[variantIndex]
    if (target && target.attributes) {
      target.attributes = target.attributes.filter((_, idx) => idx !== attrIndex)
      setValue("variants", currentVariants, { shouldDirty: true })
    }
  }

  const handleCopyAttributesToSelected = (sourceVariantIndex: number) => {
    const currentVariants = [...(getValues("variants") || [])]
    const source = currentVariants[sourceVariantIndex]
    if (!source || !source.attributes) return

    const sourceAttrs = [...source.attributes]
    const targets =
      selectedVariantIndices.length > 0
        ? selectedVariantIndices.filter((i) => i !== sourceVariantIndex)
        : currentVariants.map((_, i) => i).filter((i) => i !== sourceVariantIndex)

    targets.forEach((i) => {
      if (currentVariants[i]) {
        currentVariants[i] = {
          ...currentVariants[i],
          attributes: sourceAttrs.map((a) => ({ ...a }))
        }
      }
    })

    setValue("variants", currentVariants, { shouldDirty: true })
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

      {/* 1. SINGLE PRODUCT MODE */}
      {!hasOptions ? (
        <SingleProductMode
          price={variants[0]?.price ?? 0}
          quantity={variants[0]?.quantity ?? 0}
          sku={variants[0]?.sku ?? ""}
          onPriceChange={handleSinglePriceChange}
          onQuantityChange={handleSingleQuantityChange}
          onSkuChange={handleSingleSkuChange}
        />
      ) : (
        /* 2. MULTI-VARIANT MODE */
        <div className="space-y-6">
          {/* 2.1 Product option and product option values */}
          <ProductOptionSection
            optionFields={optionFields}
            options={options}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
            onUpdateOptionName={handleUpdateOptionName}
            onAddValue={handleAddValue}
            onUpdateValue={handleUpdateValue}
            onRemoveValue={handleRemoveValue}
            onReorderValues={handleReorderValues}
            onToggleShowing={handleToggleShowing}
            onDragEndOption={handleDragEndOption}
          />

          {/* 2.2 Product variants (Variants Matrix Table & Expandable Specs) */}
          {variants.length > 0 && (
            <ProductVariantsMatrixTable
              variants={variants}
              selectedIndices={selectedVariantIndices}
              expandedIndices={expandedVariantIndices}
              onSelectAll={handleSelectAllVariants}
              onSelectVariant={handleSelectVariant}
              onToggleExpand={toggleExpandVariant}
              onApplyBulkPrice={handleApplyBulkPrice}
              onApplyBulkStock={handleApplyBulkStock}
              onUpdateVariantField={handleUpdateVariantField}
              onAddVariantAttribute={handleAddVariantAttribute}
              onUpdateVariantAttribute={handleUpdateVariantAttribute}
              onRemoveVariantAttribute={handleRemoveVariantAttribute}
              onCopyAttributesToSelected={handleCopyAttributesToSelected}
            />
          )}
        </div>
      )}
    </div>
  )
}
