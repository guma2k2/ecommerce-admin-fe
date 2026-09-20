import React, { useEffect, useState } from "react"
import { useFormContext, useFieldArray, useWatch } from "react-hook-form"
import type { DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { Layers } from "lucide-react"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { cartesian } from "~/shared/utils/appUtils"
import type {
  ProductFormSchema,
  ProductVariantFormItem
} from "~/features/authenticate/manageProduct/validator"
import {
  generateVariantSku,
  isVariantMatchingCombo,
  getCombinationSignature,
  type ComboOptionItem
} from "~/features/authenticate/manageProduct/helpers"
import SingleProductMode from "./SingleProductMode"
import ProductOptionSection from "./ProductOptionSection"
import ProductVariantsMatrixTable from "./ProductVariantsMatrixTable"
import AddVariantDialog, { type NewVariantData } from "./AddVariantDialog"

export interface ProductVariantCardProps {
  initialSingleVariantId?: number | null
  initialVariants?: ProductVariantFormItem[]
}

export default function ProductVariantCard({
  initialSingleVariantId,
  initialVariants
}: ProductVariantCardProps = {}) {
  const { control, setValue, getValues } = useFormContext<ProductFormSchema>()
  const hasOptions = useWatch({ control, name: "hasOptions" })
  const rawOptions = useWatch({ control, name: "options" })
  const options = React.useMemo(() => rawOptions || [], [rawOptions])
  const rawVariants = useWatch({ control, name: "variants" })
  const variants = React.useMemo(() => rawVariants || [], [rawVariants])
  const productSlug = useWatch({ control, name: "slug" }) || "PROD"

  const [selectedVariantIndices, setSelectedVariantIndices] = useState<number[]>([])
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false)

  // Track signatures of combinations explicitly excluded by the user or not present in initialVariants
  const [excludedSignatures, setExcludedSignatures] = useState<Set<string>>(() => {
    const initialExcluded = new Set<string>()
    if (initialVariants && initialVariants.length > 0 && options.length > 0) {
      const validOptions = options.filter(
        (opt) => opt.name?.trim() && opt.values && opt.values.some((v) => v.value?.trim())
      )
      if (validOptions.length > 0) {
        const valueMatrix: ComboOptionItem[][] = validOptions.map((opt) => {
          const optId = opt.productOptionId ?? opt.id ?? opt.name.trim().toLowerCase()
          return opt.values
            .filter((v) => v.value?.trim())
            .map((v) => ({
              optionId: optId,
              optionName: opt.name.trim(),
              value: v.value.trim(),
              optionValueId: v.id || null
            }))
        })
        const combinations = cartesian(valueMatrix)
        const claimedInitialIds = new Set<number>()
        combinations.forEach((combo) => {
          const matchedVariant = initialVariants.find(
            (iv) =>
              (iv.id == null || !claimedInitialIds.has(iv.id)) &&
              isVariantMatchingCombo(iv, combo)
          )
          if (matchedVariant) {
            if (typeof matchedVariant.id === "number") {
              claimedInitialIds.add(matchedVariant.id)
            }
          } else {
            initialExcluded.add(getCombinationSignature(combo))
          }
        })
      }
    }
    return initialExcluded
  })

  // Ref to cache custom-created variants or field overrides
  const customVariantsMapRef = React.useRef<Map<string, ProductVariantFormItem>>(new Map())

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
    if (!hasOptions) return

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
            sku: generateVariantSku(productSlug, "DEFAULT"),
            price: Number(getValues("simplePrice")) || 0,
            quantity: Number(getValues("simpleQuantity")) || 0
          }
        ])
      }
      return
    }

    const valueMatrix: ComboOptionItem[][] = validOptions.map((opt) => {
      const optId = opt.productOptionId ?? opt.id ?? opt.name.trim().toLowerCase()
      return opt.values
        .filter((v) => v.value?.trim())
        .map((v) => ({
          optionId: optId,
          optionName: opt.name.trim(),
          value: v.value.trim(),
          optionValueId: v.id || null
        }))
    })

    const allCombinations = cartesian(valueMatrix)
    // Filter out combinations that have been explicitly deleted/excluded
    const combinations = allCombinations.filter((combo) => {
      const sig = getCombinationSignature(combo)
      return !excludedSignatures.has(sig)
    })

    const currentVariants = getValues("variants") || []
    const claimedVariants = new Set<ProductVariantFormItem>()
    const claimedVariantIds = new Set<number>()

    const newVariants = combinations.map((combo, idx) => {
      const comboTitle = combo.map((c) => c.value).join(" / ")
      const comboSig = getCombinationSignature(combo)
      const customSaved = customVariantsMapRef.current.get(comboSig)

      // Match strictly by (option id, option value) set rather than comparing titles
      const matchingExisting =
        currentVariants.find(
          (v) =>
            !claimedVariants.has(v) &&
            (v.id == null || !claimedVariantIds.has(v.id)) &&
            isVariantMatchingCombo(v, combo)
        ) ||
        initialVariants?.find(
          (v) =>
            !claimedVariants.has(v) &&
            (v.id == null || !claimedVariantIds.has(v.id)) &&
            isVariantMatchingCombo(v, combo)
        ) ||
        customSaved

      if (matchingExisting) {
        claimedVariants.add(matchingExisting)
        if (typeof matchingExisting.id === "number") {
          claimedVariantIds.add(matchingExisting.id)
        }
      }

      return {
        id: matchingExisting?.id || null,
        title: comboTitle,
        sku: matchingExisting?.sku || generateVariantSku(productSlug, comboTitle, idx),
        price: matchingExisting
          ? Number(matchingExisting.price)
          : Number(getValues("simplePrice")) || 0,
        quantity: matchingExisting
          ? Number(matchingExisting.quantity)
          : Number(getValues("simpleQuantity")) || 0,
        image: matchingExisting?.image || "",
        mediaId: matchingExisting?.mediaId || undefined,
        productOptionValueIds: combo
          .map((c) => c.optionValueId)
          .filter((id): id is number => typeof id === "number"),
        optionValues: combo.map((c) => ({
          optionId: c.optionId,
          optionName: c.optionName,
          optionValueId: c.optionValueId,
          value: c.value
        })),
        attributes: matchingExisting?.attributes || []
      }
    })

    setValue("variants", newVariants, { shouldValidate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasOptions, optionsJson, initialVariants, excludedSignatures])

  // Handle switching between single product and multi-variant mode
  const handleToggleHasOptions = (checked: boolean) => {
    setValue("hasOptions", checked, { shouldDirty: true })
    if (!checked) {
      // Clean reset of single product mode values to default empty
      setValue("simplePrice", 0, { shouldDirty: true })
      setValue("simpleQuantity", 0, { shouldDirty: true })
      setValue(
        "variants",
        [
          {
            id: initialSingleVariantId ?? null,
            title: "Default Variant",
            sku: "",
            price: 0,
            quantity: 0,
            image: "",
            mediaId: undefined,
            productOptionValueIds: [],
            attributes: []
          }
        ],
        { shouldValidate: true, shouldDirty: true }
      )
    }
  }

  // Single Product Mode Handlers
  const handleSinglePriceChange = (val: number) => {
    setValue("simplePrice", val, { shouldDirty: true })
    const currentVariants = getValues("variants") || []
    if (currentVariants.length > 0) {
      setValue("variants.0.price", val, { shouldDirty: true })
    } else {
      setValue(
        "variants",
        [
          {
            id: initialSingleVariantId ?? null,
            title: "Default Variant",
            sku: "",
            price: val,
            quantity: Number(getValues("simpleQuantity")) || 0,
            image: "",
            mediaId: undefined,
            productOptionValueIds: [],
            attributes: []
          }
        ],
        { shouldDirty: true }
      )
    }
  }

  const handleSingleQuantityChange = (val: number) => {
    setValue("simpleQuantity", val, { shouldDirty: true })
    const currentVariants = getValues("variants") || []
    if (currentVariants.length > 0) {
      setValue("variants.0.quantity", val, { shouldDirty: true })
    } else {
      setValue(
        "variants",
        [
          {
            id: initialSingleVariantId ?? null,
            title: "Default Variant",
            sku: "",
            price: Number(getValues("simplePrice")) || 0,
            quantity: val,
            image: "",
            mediaId: undefined,
            productOptionValueIds: [],
            attributes: []
          }
        ],
        { shouldDirty: true }
      )
    }
  }

  // Multi-variant Option Axis Handlers
  const handleAddOption = () => {
    const nextPosition = optionFields.length
    appendOption({
      id: crypto.randomUUID(),
      name: "",
      position: nextPosition,
      showing: true,
      values: []
    })
  }

  const handleRemoveOption = (optionIndex: number) => {
    removeOption(optionIndex)
  }

  const handleUpdateOptionName = (
    optionIndex: number,
    name: string,
    productOptionId?: number
  ) => {
    setValue(`options.${optionIndex}.name`, name, { shouldDirty: true })
    if (productOptionId !== undefined) {
      setValue(`options.${optionIndex}.productOptionId`, productOptionId, { shouldDirty: true })
    }
  }

  const handleAddValue = (optionIndex: number, valueText: string) => {
    const trimmed = valueText.trim()
    if (!trimmed) return

    const currentValues = getValues(`options.${optionIndex}.values`) || []
    if (!currentValues.some((v) => v.value.toLowerCase() === trimmed.toLowerCase())) {
      const nextPos = currentValues.length
      const updated = [
        ...currentValues.filter((v) => v.value.trim()),
        { id: null, value: trimmed, position: nextPos }
      ]
      setValue(`options.${optionIndex}.values`, updated, { shouldDirty: true })
    }
  }

  const handleUpdateValue = (optionIndex: number, valueIndex: number, newValue: string) => {
    setValue(`options.${optionIndex}.values.${valueIndex}.value`, newValue, { shouldDirty: true })
  }

  const handleRemoveValue = (optionIndex: number, valueIndex: number) => {
    const currentValues = getValues(`options.${optionIndex}.values`) || []
    const remaining = currentValues
      .filter((_, idx) => idx !== valueIndex)
      .map((v, i) => ({ ...v, position: i }))
    setValue(`options.${optionIndex}.values`, remaining, { shouldDirty: true })
  }

  const handleReorderValues = (optionIndex: number, oldIndex: number, newIndex: number) => {
    const currentValues = getValues(`options.${optionIndex}.values`) || []
    const reordered = arrayMove(currentValues, oldIndex, newIndex).map((v, i) => ({
      ...v,
      position: i
    }))
    setValue(`options.${optionIndex}.values`, reordered, { shouldDirty: true })
  }

  const handleToggleShowing = (optionIndex: number, showing: boolean) => {
    setValue(`options.${optionIndex}.showing`, showing, { shouldDirty: true })
  }

  const handleDoneOption = (optionIndex: number, pendingValue?: string) => {
    const trimmed = (pendingValue || "").trim()
    const currentValues = getValues(`options.${optionIndex}.values`) || []
    let updatedValues = currentValues.filter((v) => v.value?.trim())

    if (trimmed && !updatedValues.some((v) => v.value.toLowerCase() === trimmed.toLowerCase())) {
      updatedValues = [
        ...updatedValues,
        {
          id: null,
          value: trimmed,
          position: updatedValues.length
        }
      ]
    }

    setValue(`options.${optionIndex}.values`, updatedValues, { shouldDirty: true })
    setValue(`options.${optionIndex}.showing`, false, { shouldDirty: true })
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

  // Variant Deletion Handlers
  const handleDeleteVariant = (index: number) => {
    const currentVariants = [...(getValues("variants") || [])]
    if (currentVariants.length <= 1) return
    const target = currentVariants[index]
    if (!target) return

    let sig = ""
    if (target.optionValues && target.optionValues.length > 0) {
      sig = getCombinationSignature(target.optionValues)
    } else if (target.title) {
      const parts = target.title.split("/").map((p) => p.trim())
      sig = getCombinationSignature(
        parts.map((p, i) => ({
          optionId: options[i]?.productOptionId ?? options[i]?.id ?? options[i]?.name ?? `opt-${i}`,
          optionName: options[i]?.name || `Option ${i + 1}`,
          value: p
        }))
      )
    }

    if (sig) {
      setExcludedSignatures((prev) => {
        const next = new Set(prev)
        next.add(sig)
        return next
      })
    }

    const remaining = currentVariants.filter((_, i) => i !== index)
    setValue("variants", remaining, { shouldValidate: true, shouldDirty: true })
    setSelectedVariantIndices((prev) =>
      prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
    )
  }

  const handleBulkDeleteVariants = (indices: number[]) => {
    const currentVariants = [...(getValues("variants") || [])]
    if (currentVariants.length - indices.length < 1) return

    const indicesSet = new Set(indices)
    const toDelete = currentVariants.filter((_, i) => indicesSet.has(i))

    const newExcluded = new Set<string>()
    toDelete.forEach((target) => {
      let sig = ""
      if (target.optionValues && target.optionValues.length > 0) {
        sig = getCombinationSignature(target.optionValues)
      } else if (target.title) {
        const parts = target.title.split("/").map((p) => p.trim())
        sig = getCombinationSignature(
          parts.map((p, i) => ({
            optionId: options[i]?.productOptionId ?? options[i]?.id ?? options[i]?.name ?? `opt-${i}`,
            optionName: options[i]?.name || `Option ${i + 1}`,
            value: p
          }))
        )
      }
      if (sig) newExcluded.add(sig)
    })

    setExcludedSignatures((prev) => {
      const next = new Set(prev)
      newExcluded.forEach((s) => next.add(s))
      return next
    })

    const remaining = currentVariants.filter((_, i) => !indicesSet.has(i))
    setValue("variants", remaining, { shouldValidate: true, shouldDirty: true })
    setSelectedVariantIndices([])
  }

  // Custom Add Variant Handler
  const handleAddCustomVariant = (data: NewVariantData) => {
    const currentOptions = getValues("options") || []
    const currentVariants = getValues("variants") || []

    // 1. Calculate combinations before adding any new option values
    const validOldOptions = currentOptions.filter(
      (opt) => opt.name?.trim() && opt.values && opt.values.some((v) => v.value?.trim())
    )
    const oldMatrix: ComboOptionItem[][] = validOldOptions.map((opt) => {
      const optId = opt.productOptionId ?? opt.id ?? opt.name.trim().toLowerCase()
      return (opt.values || [])
        .filter((v) => v.value?.trim())
        .map((v) => ({
          optionId: optId,
          optionName: opt.name.trim(),
          value: v.value.trim(),
          optionValueId: v.id || null
        }))
    })
    const oldCombos = cartesian(oldMatrix)
    const oldSignatures = new Set(oldCombos.map((c) => getCombinationSignature(c)))

    // 2. Register any new option values in options state
    let hasNewValues = false
    const updatedOptions = currentOptions.map((opt) => {
      const sel = data.optionSelections.find(
        (s) => s.optionName.trim().toLowerCase() === opt.name.trim().toLowerCase()
      )
      if (!sel) return opt

      const currentVals = opt.values || []
      const valExists = currentVals.some(
        (v) => v.value.trim().toLowerCase() === sel.value.trim().toLowerCase()
      )

      if (!valExists) {
        hasNewValues = true
        return {
          ...opt,
          values: [
            ...currentVals,
            { id: null, value: sel.value.trim(), position: currentVals.length }
          ]
        }
      }
      return opt
    })

    // 3. Compute combinations with updated options to find unwanted combinations
    const validNewOptions = updatedOptions.filter(
      (opt) => opt.name?.trim() && opt.values && opt.values.some((v) => v.value?.trim())
    )
    const newMatrix: ComboOptionItem[][] = validNewOptions.map((opt) => {
      const optId = opt.productOptionId ?? opt.id ?? opt.name.trim().toLowerCase()
      return (opt.values || [])
        .filter((v) => v.value?.trim())
        .map((v) => ({
          optionId: optId,
          optionName: opt.name.trim(),
          value: v.value.trim(),
          optionValueId: v.id || null
        }))
    })
    const allNewCombos = cartesian(newMatrix)
    const desiredSig = getCombinationSignature(data.optionSelections)

    // Any newly introduced combination that isn't the desired one should be excluded
    const unwantedSignatures = new Set<string>()
    allNewCombos.forEach((combo) => {
      const sig = getCombinationSignature(combo)
      if (!oldSignatures.has(sig) && sig !== desiredSig) {
        unwantedSignatures.add(sig)
      }
    })

    // 4. Build the new variant item
    const comboTitle = data.optionSelections.map((s) => s.value).join(" / ")
    const newVariantItem: ProductVariantFormItem = {
      id: null,
      title: comboTitle,
      sku: generateVariantSku(productSlug, comboTitle, currentVariants.length),
      price: data.price,
      quantity: data.quantity,
      image: data.image || "",
      mediaId: data.mediaId,
      productOptionValueIds: [],
      optionValues: data.optionSelections.map((s) => ({
        optionId: s.optionId ?? null,
        optionName: s.optionName,
        optionValueId: null,
        value: s.value
      })),
      attributes: []
    }

    // Cache in ref for preservation
    customVariantsMapRef.current.set(desiredSig, newVariantItem)

    // 5. Update excludedSignatures: remove desiredSig (in case it was previously deleted), add unwanted signatures
    setExcludedSignatures((prev) => {
      const next = new Set(prev)
      unwantedSignatures.forEach((s) => next.add(s))
      next.delete(desiredSig)
      return next
    })

    // 6. Update options in form if new values were added, else update variants directly
    if (hasNewValues) {
      setValue("options", updatedOptions, { shouldDirty: true })
    } else {
      setValue("variants", [...currentVariants, newVariantItem], {
        shouldValidate: true,
        shouldDirty: true
      })
    }
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

  // Variant-level attribute handler for template attributes with applyTo === 'variant'
  const handleUpdateVariantAttribute = (
    variantIndex: number,
    productAttributeId: number,
    name: string,
    val: string
  ) => {
    const currentVariants = [...(getValues("variants") || [])]
    const target = currentVariants[variantIndex]
    if (target) {
      const existingAttrs = target.attributes || []
      const existingIndex = existingAttrs.findIndex(
        (a) => Number(a.productAttributeId) === Number(productAttributeId)
      )
      let updatedAttrs: typeof existingAttrs
      if (existingIndex >= 0) {
        updatedAttrs = existingAttrs.map((a, i) =>
          i === existingIndex ? { ...a, value: val } : a
        )
      } else {
        updatedAttrs = [
          ...existingAttrs,
          { productAttributeId, name, value: val, applyTo: "variant" as const }
        ]
      }
      currentVariants[variantIndex] = {
        ...target,
        attributes: updatedAttrs
      }
      setValue("variants", currentVariants, { shouldDirty: true })
    }
  }

  // Bulk set an attribute value across selected variants
  const handleApplyBulkAttribute = (
    productAttributeId: number,
    name: string,
    val: string
  ) => {
    const currentVariants = [...(getValues("variants") || [])]
    const targetIndices =
      selectedVariantIndices.length > 0
        ? selectedVariantIndices
        : currentVariants.map((_, i) => i)

    targetIndices.forEach((idx) => {
      const v = currentVariants[idx]
      if (v) {
        const existingAttrs = v.attributes || []
        const existingIndex = existingAttrs.findIndex(
          (a) => Number(a.productAttributeId) === Number(productAttributeId)
        )
        let updatedAttrs: typeof existingAttrs
        if (existingIndex >= 0) {
          updatedAttrs = existingAttrs.map((a, i) =>
            i === existingIndex ? { ...a, value: val } : a
          )
        } else {
          updatedAttrs = [
            ...existingAttrs,
            { productAttributeId, name, value: val, applyTo: "variant" as const }
          ]
        }
        currentVariants[idx] = {
          ...v,
          attributes: updatedAttrs
        }
      }
    })

    setValue("variants", currentVariants, { shouldDirty: true })
  }

  // Copy specifications from one variant to other selected (or all) variants
  const handleCopyAttributesToSelected = (sourceVariantIndex: number) => {
    const currentVariants = [...(getValues("variants") || [])]
    const source = currentVariants[sourceVariantIndex]
    if (!source || !source.attributes) return

    const targetIndices =
      selectedVariantIndices.length > 0
        ? selectedVariantIndices.filter((i) => i !== sourceVariantIndex)
        : currentVariants.map((_, i) => i).filter((i) => i !== sourceVariantIndex)

    targetIndices.forEach((idx) => {
      const v = currentVariants[idx]
      if (v) {
        currentVariants[idx] = {
          ...v,
          attributes: source.attributes?.map((a) => ({ ...a })) || []
        }
      }
    })

    setValue("variants", currentVariants, { shouldDirty: true })
  }

  const formAttributes = useWatch({ control, name: "attributes" }) || []
  const variantAttributes = formAttributes.filter((a) => a.applyTo === "variant")

  const existingSignatures = React.useMemo(() => {
    const set = new Set<string>()
    variants.forEach((v) => {
      if (v.optionValues && v.optionValues.length > 0) {
        set.add(getCombinationSignature(v.optionValues))
      } else if (v.title) {
        const parts = v.title.split("/").map((p) => p.trim())
        set.add(
          getCombinationSignature(
            parts.map((p, i) => ({
              optionId: options[i]?.productOptionId ?? options[i]?.id ?? options[i]?.name ?? `opt-${i}`,
              optionName: options[i]?.name || `Option ${i + 1}`,
              value: p
            }))
          )
        )
      }
    })
    return set
  }, [variants, options])

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
            onCheckedChange={(checked) => handleToggleHasOptions(!!checked)}
          />
          <span>Multiple variations (Size, Color, etc.)</span>
        </label>
      </div>

      {/* 1. SINGLE PRODUCT MODE */}
      {!hasOptions ? (
        <SingleProductMode
          price={variants[0]?.price ?? 0}
          quantity={variants[0]?.quantity ?? 0}
          onPriceChange={handleSinglePriceChange}
          onQuantityChange={handleSingleQuantityChange}
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
            onDoneOption={handleDoneOption}
            onDragEndOption={handleDragEndOption}
          />

          {/* 2.2 Product variants (Variants Matrix Table) */}
          {variants.length > 0 && (
            <ProductVariantsMatrixTable
              variants={variants}
              selectedIndices={selectedVariantIndices}
              variantAttributes={variantAttributes}
              onSelectAll={handleSelectAllVariants}
              onSelectVariant={handleSelectVariant}
              onApplyBulkPrice={handleApplyBulkPrice}
              onApplyBulkStock={handleApplyBulkStock}
              onApplyBulkAttribute={handleApplyBulkAttribute}
              onCopyAttributesToSelected={handleCopyAttributesToSelected}
              onUpdateVariantField={handleUpdateVariantField}
              onUpdateVariantAttribute={handleUpdateVariantAttribute}
              onAddVariantClick={() => setIsAddVariantOpen(true)}
              onDeleteVariant={handleDeleteVariant}
              onBulkDeleteVariants={handleBulkDeleteVariants}
            />
          )}

          {/* Custom Add Variant Dialog */}
          <AddVariantDialog
            open={isAddVariantOpen}
            onOpenChange={setIsAddVariantOpen}
            options={options}
            existingSignatures={existingSignatures}
            defaultPrice={Number(getValues("simplePrice")) || 0}
            defaultQuantity={Number(getValues("simpleQuantity")) || 0}
            onSaveVariant={handleAddCustomVariant}
          />
        </div>
      )}
    </div>
  )
}
