import React, { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router"
import { ArrowLeft, Save, Loader2, PackagePlus, Edit3 } from "lucide-react"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"
import { showToast } from "~/shared/utils/toast"
import {
  productFormSchema,
  type ProductFormSchema
} from "~/features/authenticate/manageProduct/validator"
import ProductGeneralInfoCard from "./ProductGeneralInfoCard"
import ProductMediaCard from "./ProductMediaCard"
import ProductVariantCard from "./ProductVariantCard"
import ProductClassificationCard from "./ProductClassificationCard"
import ProductAttributesCard from "./ProductAttributesCard"
import ProductSeoCard from "./ProductSeoCard"
import {
  createProduct,
  updateProduct
} from "~/shared/services/api/productService"
import type {
  ProductResponse,
  CategoryItem,
  BrandItem,
  ProductCreateRequest,
  ProductUpdateRequest
} from "~/shared/types"

interface ProductFormProps {
  mode: "create" | "edit"
  initialData?: ProductResponse | null
  categories?: CategoryItem[]
  brands?: BrandItem[]
}

export default function ProductForm({
  mode,
  initialData,
  categories,
  brands
}: ProductFormProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Map initialData from API to Form State if in edit mode
  const defaultValues: ProductFormSchema = React.useMemo(() => {
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
      categoryId: null,
      brandId: initialData.brand?.id || null,
      status: "ACTIVE",
      medias: (initialData.medias || []).map((m) => ({
        mediaId: m.mediaId,
        position: m.position,
        url: m.url || "",
        isChecked: false
      })),
      attributes: (initialData.attributes || []).map((a) => ({
        productAttributeId: a.productAttributeId,
        name: a.name,
        value: a.value
      })),
      hasOptions: hasOptions,
      simplePrice: firstVariant?.price || 0,
      simpleQuantity: firstVariant?.quantity || 0,
      simpleSku: firstVariant?.sku || "",
      options: (initialData.options || []).map((opt) => ({
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
        productOptionValueIds: v.productOptionValueIds
      }))
    }
  }, [initialData, mode])

  const methods = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues
  })

  const { handleSubmit, formState } = methods
  const { isDirty } = formState

  const onSubmit = async (values: ProductFormSchema) => {
    try {
      setIsSubmitting(true)

      // 1. Prepare options payload
      const optionsPayload = values.hasOptions
        ? values.options
            .filter((opt) => opt.name.trim() && opt.values.some((v) => v.value.trim()))
            .map((opt, optIndex) => ({
              productOptionId: opt.productOptionId,
              name: opt.name,
              position: optIndex,
              values: opt.values
                .filter((v) => v.value.trim())
                .map((v, valIndex) => ({
                  id: mode === "edit" ? v.id || null : undefined,
                  value: v.value.trim(),
                  position: valIndex
                }))
            }))
        : []

      // 2. Prepare variants payload
      const variantsPayload = values.variants.map((v, idx) => ({
        id: mode === "edit" ? v.id || null : undefined,
        title: v.title || `Variant ${idx + 1}`,
        sku: (v.sku || "").trim() || `${values.slug.toUpperCase()}-${idx + 1}`,
        price: Number(v.price) || 0,
        quantity: Number(v.quantity) || 0,
        mediaId: v.mediaId
      }))

      // 3. Prepare medias payload
      const mediasPayload = values.medias.map((m, pos) => ({
        mediaId: m.mediaId,
        position: pos
      }))

      // 4. Prepare attributes payload
      const attributesPayload = values.attributes
        .filter((a) => a.value.trim())
        .map((a) => ({
          productAttributeId: Number(a.productAttributeId),
          value: a.value.trim()
        }))

      if (mode === "create") {
        const createPayload: ProductCreateRequest = {
          name: values.name.trim(),
          slug: values.slug.trim(),
          description: values.description || undefined,
          metaTitle: values.metaTitle || undefined,
          metaKeyword: values.metaKeyword || undefined,
          metaDescription: values.metaDescription || undefined,
          categoryId: values.categoryId ? Number(values.categoryId) : null,
          brandId: values.brandId ? Number(values.brandId) : null,
          medias: mediasPayload.length ? mediasPayload : undefined,
          options: optionsPayload.length ? optionsPayload : undefined,
          attributes: attributesPayload.length ? attributesPayload : undefined,
          variants: variantsPayload
        }

        await createProduct(createPayload)
        showToast("success", "toasts.productCreated")
      } else {
        const updatePayload: ProductUpdateRequest = {
          name: values.name.trim(),
          slug: values.slug.trim(),
          description: values.description || undefined,
          metaTitle: values.metaTitle || undefined,
          metaKeyword: values.metaKeyword || undefined,
          metaDescription: values.metaDescription || undefined,
          categoryId: values.categoryId ? Number(values.categoryId) : null,
          brandId: values.brandId ? Number(values.brandId) : null,
          medias: mediasPayload.length ? mediasPayload : undefined,
          options: optionsPayload.length ? optionsPayload : undefined,
          attributes: attributesPayload.length ? attributesPayload : undefined,
          variants: variantsPayload
        }

        const targetId = initialData?.id || values.id || 1
        await updateProduct(targetId, updatePayload)
        showToast("success", "toasts.productUpdated")
      }

      navigate("/admin/manage-product")
    } catch (error: any) {
      console.error("Failed to save product:", error)
      const errorMsg = error?.message || t("product.saveError")
      showToast("error", errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sticky Action Header */}
        <div className="sticky top-0 z-40 -mx-6 -mt-6 px-6 py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              asChild
              className="h-9 w-9 bg-white dark:bg-zinc-900 shadow-xs border-gray-200 dark:border-zinc-800"
            >
              <Link to="/admin/manage-product">
                <ArrowLeft className="size-4" />
                <span className="sr-only">{t("product.backToProducts")}</span>
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2">
                  {mode === "create" ? (
                    <>
                      <PackagePlus className="size-5 text-primary" />
                      {t("product.addNew")}
                    </>
                  ) : (
                    <>
                      <Edit3 className="size-5 text-primary" />
                      {t("product.updateTitle")}: {initialData?.name}
                    </>
                  )}
                </h1>
                {mode === "edit" && initialData?.id && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    #{initialData.id}
                  </Badge>
                )}
                {isDirty && (
                  <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                    {t("product.unsavedChanges")}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {mode === "create"
                  ? t("product.addSubtitle")
                  : t("product.updateSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/manage-product")}
              className="h-9 px-4 text-xs font-medium border-gray-300 dark:border-zinc-700"
            >
              {t("product.discard")}
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="h-9 px-5 text-xs font-medium gap-1.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  {t("product.saving")}
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  {mode === "create" ? t("product.saveProduct") : t("product.saveChanges")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 2-Column Responsive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (8 cols = ~67%) */}
          <div className="lg:col-span-8 space-y-6">
            <ProductGeneralInfoCard />
            <ProductMediaCard />
            <ProductVariantCard />
            <ProductAttributesCard />
            <ProductSeoCard />
          </div>

          {/* Right Column (4 cols = ~33% Sticky) */}
          <div className="lg:col-span-4 space-y-6 sticky top-20">
            <ProductClassificationCard categories={categories} brands={brands} />

            {/* Audit / Summary Card (in Edit Mode) */}
            {mode === "edit" && initialData && (
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 space-y-3 shadow-xs text-xs">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  {t("product.productMetadata")}
                </h4>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t("product.createdAt")}</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      {initialData.createdAt ? new Date(initialData.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("product.lastUpdated")}</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      {initialData.updatedAt ? new Date(initialData.updatedAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("product.totalVariants")}</span>
                    <span className="font-semibold text-primary">
                      {initialData.variants?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
