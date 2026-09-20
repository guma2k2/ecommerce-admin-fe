import type {
  ProductFormSchema,
  ProductAttributeItemForm,
  ProductVariantOptionValueItem
} from "~/features/authenticate/manageProduct/validator"
import type {
  ProductResponse,
  ProductCreateRequest,
  ProductUpdateRequest
} from "~/shared/types"

export interface ComboOptionItem {
  optionId: number | string
  optionName: string
  optionValueId?: number | null
  value: string
}

/**
 * Generates an order-independent signature string for an option combination.
 * e.g., [{ optionName: "Color", value: "Red" }, { optionName: "Size", value: "S" }] -> "color:red|size:s"
 */
export function getCombinationSignature(
  items?: { optionId?: number | string | null; optionName?: string; value: string }[]
): string {
  if (!items || items.length === 0) return ""
  return items
    .map((item) => {
      const optKey = (item.optionName || String(item.optionId || "")).trim().toLowerCase()
      const valKey = item.value.trim().toLowerCase()
      return `${optKey}:${valKey}`
    })
    .sort()
    .join("|")
}

/**
 * Checks if an existing variant matches a given option combination set.
 * Matches by the set of (option id, option value) pairs rather than comparing titles.
 */
export function isVariantMatchingCombo(
  variant: {
    title?: string
    productOptionValueIds?: number[]
    optionValues?: ProductVariantOptionValueItem[]
  },
  combo: ComboOptionItem[]
): boolean {
  if (!combo || combo.length === 0) return false

  // 1. Primary match: by variant.optionValues
  if (variant.optionValues && variant.optionValues.length === combo.length && combo.length > 0) {
    const allMatch = combo.every((c) => {
      return variant.optionValues!.some((ov) => {
        // Match option: by optionId or by optionName
        const isOptMatched =
          (c.optionId && ov.optionId && String(c.optionId) === String(ov.optionId)) ||
          (c.optionName && ov.optionName && c.optionName.trim().toLowerCase() === ov.optionName.trim().toLowerCase())

        if (!isOptMatched) return false

        // Match value: by optionValueId if both have it, or by value text
        if (c.optionValueId && ov.optionValueId) {
          return c.optionValueId === ov.optionValueId
        }

        return c.value.trim().toLowerCase() === ov.value.trim().toLowerCase()
      })
    })

    if (allMatch) return true
  }

  // 2. Secondary match: by productOptionValueIds if combo has optionValueId for all items
  if (
    variant.productOptionValueIds &&
    variant.productOptionValueIds.length === combo.length &&
    combo.length > 0 &&
    combo.every((c) => typeof c.optionValueId === "number")
  ) {
    const idsSet = new Set(variant.productOptionValueIds)
    const allIdsMatched = combo.every((c) => idsSet.has(c.optionValueId!))
    if (allIdsMatched) return true
  }

  // 3. Tertiary match: fallback by title ONLY when variant has no complete optionValues
  const hasCompleteOptionValues =
    variant.optionValues &&
    variant.optionValues.length === combo.length &&
    variant.optionValues.every((ov) => ov.value?.trim())

  if (!hasCompleteOptionValues && variant.title && combo.length > 0) {
    const titleParts = variant.title.split("/").map((p) => p.trim().toLowerCase())
    if (titleParts.length === combo.length) {
      const comboVals = combo.map((c) => c.value.trim().toLowerCase()).sort()
      const sortedTitleParts = [...titleParts].sort()
      if (comboVals.every((val, idx) => val === sortedTitleParts[idx])) {
        return true
      }
    }
  }

  return false
}

/**
 * Auto-generates a clean, standardized SKU string.
 */
export function generateVariantSku(
  baseSlugOrName: string,
  variantTitle?: string,
  index?: number
): string {
  const cleanBase =
    (baseSlugOrName || "PRD")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 24) || "PRD"

  if (
    !variantTitle ||
    variantTitle.toLowerCase() === "default" ||
    variantTitle.toLowerCase() === "default variant" ||
    variantTitle.toLowerCase() === "default title"
  ) {
    return `${cleanBase}-DEFAULT`
  }

  // Extract clean segment codes from variant title like "Red / XL" -> "RED-XL"
  const cleanSuffix = variantTitle
    .split("/")
    .map((seg) => seg.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))
    .filter(Boolean)
    .join("-")

  if (cleanSuffix) {
    return `${cleanBase}-${cleanSuffix}`
  }

  const idxSuffix = typeof index === "number" ? String(index + 1).padStart(3, "0") : "001"
  return `${cleanBase}-${idxSuffix}`
}

/**
 * Maps incoming ProductResponse API data into ProductFormSchema state.
 */
export function getInitialProductFormValues(
  initialData?: ProductResponse | null,
  mode: "create" | "edit" = "create"
): ProductFormSchema {
  if (!initialData || mode === "create") {
    return {
      name: "",
      slug: "",
      description: "",
      metaTitle: "",
      metaKeyword: "",
      metaDescription: "",
      categoryId: null,
      brandId: null,
      status: "ACTIVE",
      medias: [],
      attributes: [],
      hasOptions: false,
      simplePrice: 0,
      simpleQuantity: 0,
      options: [],
      variants: [
        {
          id: null,
          title: "Default Title",
          sku: "",
          price: 0,
          quantity: 0
        }
      ]
    }
  }

  const hasOptions = (initialData.options && initialData.options.length > 0) || false
  const firstVariant = initialData.variants?.[0]

  return {
    id: initialData.id,
    name: initialData.name,
    slug: initialData.slug,
    description: initialData.description || "",
    metaTitle: initialData.metaTitle || "",
    metaKeyword: initialData.metaKeyword || "",
    metaDescription: initialData.metaDescription || "",
    categoryId: initialData.category?.id ?? null,
    brandId: initialData.brand?.id ?? null,
    status: "ACTIVE",
    attributeTemplateId: null,
    medias: (initialData.medias || []).map((m) => ({
      mediaId: m.mediaId,
      position: m.position,
      url: m.url || "",
      isChecked: false
    })),
    attributes: (() => {
      const baseAttrs: ProductAttributeItemForm[] = (initialData.attributes || []).map((a) => ({
        id: a.id,
        productAttributeId: a.productAttributeId,
        name: a.name || "",
        value: a.value || "",
        applyTo: "base"
      }))

      const variantAttrMap = new Map<number, { id?: number; productAttributeId: number; name?: string }>()
      ;(initialData.variants || []).forEach((v) => {
        const attrs = v.attributeValues || []
        attrs.forEach((a) => {
          if (!variantAttrMap.has(a.productAttributeId)) {
            variantAttrMap.set(a.productAttributeId, {
              id: a.id,
              productAttributeId: a.productAttributeId,
              name: a.name
            })
          }
        })
      })

      const existingBaseIds = new Set(baseAttrs.map((a) => a.productAttributeId))
      const combined: ProductAttributeItemForm[] = [...baseAttrs]
      variantAttrMap.forEach((va, id) => {
        if (!existingBaseIds.has(id)) {
          combined.push({
            productAttributeId: id,
            name: va.name || "",
            value: "",
            applyTo: "variant"
          })
        }
      })
      return combined
    })(),
    hasOptions: hasOptions,
    simplePrice: !hasOptions ? firstVariant?.price || 0 : 0,
    simpleQuantity: !hasOptions ? firstVariant?.quantity || 0 : 0,
    options: (initialData.options || []).map((opt) => ({
      id: opt.productOptionId,
      productOptionId: opt.productOptionId,
      name: opt.name,
      position: opt.position,
      showing: false,
      values: opt.values.map((v) => ({
        id: v.id,
        value: v.value,
        position: v.position
      }))
    })),
    variants: (initialData.variants || []).map((v) => {
      let optionValues: ProductVariantOptionValueItem[] = (v.productOptionValueIds || []).map((valId) => {
        const opt = initialData.options?.find((o) => o.values?.some((val) => val.id === valId))
        const val = opt?.values?.find((val) => val.id === valId)
        return {
          optionId: opt?.productOptionId ?? null,
          optionName: opt?.name || "",
          optionValueId: valId,
          value: val?.value || ""
        }
      })

      // Fallback: infer optionValues from title if productOptionValueIds was empty in database
      if (
        optionValues.length === 0 &&
        v.title &&
        initialData.options &&
        initialData.options.length > 0
      ) {
        const titleParts = v.title.split("/").map((p) => p.trim())
        if (titleParts.length === initialData.options.length) {
          optionValues = titleParts.map((part, idx) => {
            const opt = initialData.options![idx]
            const matchedVal = opt.values?.find(
              (val) => val.value?.trim().toLowerCase() === part.toLowerCase()
            )
            return {
              optionId: opt.productOptionId ?? null,
              optionName: opt.name || "",
              optionValueId: matchedVal?.id ?? null,
              value: part
            }
          })
        }
      }

      return {
        id: v.id,
        title: v.title,
        sku: v.sku,
        price: v.price,
        quantity: v.quantity,
        mediaId: v.mediaId || undefined,
        image: v.mediaUrl || initialData.medias?.find((m) => m.mediaId === v.mediaId)?.url || "",
        productOptionValueIds: v.productOptionValueIds,
        optionValues,
        attributes: (v.attributeValues || []).map((a) => ({
          id: a.id,
          productAttributeId: a.productAttributeId,
          name: a.name || "",
          value: a.value || "",
          applyTo: "variant" as const
        }))
      }
    })
  }
}

/**
 * Transforms ProductFormSchema values into ProductCreateRequest or ProductUpdateRequest payload.
 * Adheres strictly to PRODUCT_API_INTEGRATION_GUIDE.md request schemas.
 */
export function transformProductFormToPayload(
  values: ProductFormSchema,
  mode: "create" | "edit"
): ProductCreateRequest | ProductUpdateRequest {
  // 1. Prepare options payload
  const optionsPayload = values.hasOptions
    ? values.options
        .filter((opt) => opt.name.trim() && opt.values.some((v) => v.value.trim()))
        .map((opt, optIndex) => {
          const resolvedOptionId = Number(opt.productOptionId ?? opt.id)
          return {
            productOptionId: resolvedOptionId,
            position: optIndex,
            values: opt.values
              .filter((v) => v.value.trim())
              .map((v, valIndex) => ({
                ...(mode === "edit" && typeof v.id === "number" ? { id: v.id } : {}),
                value: v.value.trim(),
                position: valIndex
              }))
          }
        })
    : []

  // 2. Prepare variants payload
  const variantsPayload = !values.hasOptions
    ? [
        {
          ...(mode === "edit" && typeof values.variants[0]?.id === "number"
            ? { id: values.variants[0].id }
            : {}),
          title: values.variants[0]?.title?.trim() || "Default Variant",
          sku:
            (values.variants[0]?.sku || "").trim() ||
            generateVariantSku(values.slug || values.name, "DEFAULT"),
          price: Number(values.variants[0]?.price ?? values.simplePrice) || 0,
          quantity: Number(values.variants[0]?.quantity ?? values.simpleQuantity) || 0,
          mediaId: values.variants[0]?.mediaId || null,
          optionValues: [],
          attributeValues: []
        }
      ]
    : values.variants.map((v, idx) => {
        const variantAttrs = (v.attributes || [])
          .filter((a) => a.value?.trim())
          .map((a) => ({
            productAttributeId: Number(a.productAttributeId),
            value: a.value.trim()
          }))

        // Resolve option values: use v.optionValues, or deduce from title if not set
        let resolvedOptionValues = v.optionValues
        if (
          (!resolvedOptionValues || resolvedOptionValues.length === 0) &&
          v.title &&
          values.options?.length
        ) {
          const parts = v.title.split("/").map((p) => p.trim())
          if (parts.length === values.options.length) {
            resolvedOptionValues = parts.map((part, pIdx) => {
              const opt = values.options[pIdx]
              const optId = Number(opt.productOptionId ?? opt.id)
              const foundVal = opt.values?.find(
                (val) => val.value?.trim().toLowerCase() === part.toLowerCase()
              )
              return {
                optionId: optId,
                optionName: opt.name,
                optionValueId: typeof foundVal?.id === "number" ? foundVal.id : null,
                value: part
              }
            })
          }
        }

        const optionValuesPayload =
          mode === "create"
            ? (resolvedOptionValues || [])
                .filter((ov) => ov.value?.trim())
                .map((ov) => ({
                  productOptionId: Number(ov.optionId),
                  value: ov.value.trim()
                }))
            : (resolvedOptionValues || [])
                .filter((ov) => ov.value?.trim())
                .map((ov) => {
                  const valId =
                    typeof ov.optionValueId === "number"
                      ? ov.optionValueId
                      : null
                  return {
                    ...(valId !== null ? { productOptionValueId: valId } : {}),
                    productOptionId: Number(ov.optionId),
                    value: ov.value.trim()
                  }
                })

        return {
          ...(mode === "edit" && typeof v.id === "number" ? { id: v.id } : {}),
          title: v.title?.trim() || "Default",
          sku: (v.sku || "").trim() || generateVariantSku(values.slug || values.name, v.title, idx),
          price: Number(v.price) || 0,
          quantity: Number(v.quantity) || 0,
          mediaId: v.mediaId || null,
          optionValues: optionValuesPayload,
          attributeValues: variantAttrs
        }
      })

  // 3. Prepare medias payload
  const mediasPayload = values.medias.map((m, pos) => ({
    mediaId: m.mediaId,
    position: pos
  }))

  // 4. Prepare attributes payload for base product
  const attributesPayload = values.attributes
    .filter((a) => a.applyTo !== "variant" && a.value?.trim())
    .map((a) => ({
      productAttributeId: Number(a.productAttributeId),
      value: a.value.trim()
    }))

  const basePayload = {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description?.trim() || null,
    metaTitle: values.metaTitle?.trim() || null,
    metaKeyword: values.metaKeyword?.trim() || null,
    metaDescription: values.metaDescription?.trim() || null,
    categoryId: values.categoryId ? Number(values.categoryId) : null,
    brandId: values.brandId ? Number(values.brandId) : null,
    medias: mediasPayload,
    options: optionsPayload,
    attributes: attributesPayload,
    variants: variantsPayload
  }

  if (mode === "create") {
    return basePayload as ProductCreateRequest
  }

  return basePayload as ProductUpdateRequest
}
