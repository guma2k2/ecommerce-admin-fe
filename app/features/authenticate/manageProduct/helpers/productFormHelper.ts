import type {
  ProductFormSchema,
  ProductAttributeItemForm
} from "~/features/authenticate/manageProduct/validator"
import type {
  ProductResponse,
  ProductCreateRequest,
  ProductUpdateRequest
} from "~/shared/types"

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
      simpleSku: "",
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
    categoryId: initialData.categoryId ?? initialData.category?.id ?? null,
    brandId: initialData.brand?.id || null,
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
    simplePrice: firstVariant?.price || 0,
    simpleQuantity: firstVariant?.quantity || 0,
    simpleSku: firstVariant?.sku || "",
    options: (initialData.options || []).map((opt) => ({
      id: opt.id,
      productOptionId: opt.productOptionId,
      name: opt.name,
      position: opt.position,
      showing: true,
      values: opt.values.map((v) => ({
        id: v.id,
        value: v.value,
        position: v.position
      }))
    })),
    variants: (initialData.variants || []).map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: v.price,
      quantity: v.quantity,
      mediaId: v.mediaId || undefined,
      image: v.mediaUrl || initialData.medias?.find((m) => m.mediaId === v.mediaId)?.url || "",
      productOptionValueIds: v.productOptionValueIds,
      attributes: (v.attributeValues || []).map((a) => ({
        id: a.id,
        productAttributeId: a.productAttributeId,
        name: a.name || "",
        value: a.value || "",
        applyTo: "variant" as const
      }))
    }))
  }
}

/**
 * Transforms ProductFormSchema values into ProductCreateRequest or ProductUpdateRequest payload.
 */
export function transformProductFormToPayload(
  values: ProductFormSchema,
  mode: "create" | "edit"
): ProductCreateRequest | ProductUpdateRequest {
  // 1. Prepare options payload
  const optionsPayload = values.hasOptions
    ? values.options
        .filter((opt) => opt.name.trim() && opt.values.some((v) => v.value.trim()))
        .map((opt, optIndex) => ({
          ...(mode === "edit" && typeof opt.id === "number" ? { id: opt.id } : {}),
          productOptionId: opt.productOptionId || optIndex + 1,
          position: optIndex,
          values: opt.values
            .filter((v) => v.value.trim())
            .map((v) => ({
              ...(mode === "edit" && typeof v.id === "number" ? { id: v.id } : {}),
              value: v.value.trim()
            }))
        }))
    : []

  // 2. Prepare variants payload
  const variantsPayload = values.variants.map((v, idx) => {
    const variantAttrs = (v.attributes || [])
      .filter((a) => a.value?.trim())
      .map((a) => ({
        ...(mode === "edit" && typeof a.id === "number" ? { id: a.id } : {}),
        productAttributeId: Number(a.productAttributeId),
        value: a.value.trim()
      }))

    return {
      ...(mode === "edit" && typeof v.id === "number" ? { id: v.id } : {}),
      title: v.title?.trim() || "Default",
      sku: (v.sku || "").trim() || `${values.slug.toUpperCase()}-${idx + 1}`,
      price: Number(v.price) || 0,
      quantity: Number(v.quantity) || 0,
      mediaId: v.mediaId || null,
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
      ...(mode === "edit" && typeof a.id === "number" ? { id: a.id } : {}),
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
