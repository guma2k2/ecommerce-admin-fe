import React, { useImperativeHandle, forwardRef, useEffect, useMemo } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import {
  productFormSchema,
  type ProductFormSchema
} from "~/features/authenticate/manageProduct/validator"
import {
  getInitialProductFormValues,
  transformProductFormToPayload
} from "~/features/authenticate/manageProduct/helpers"
import ProductGeneralInfoCard from "./ProductGeneralInfoCard"
import ProductMediaCard from "./ProductMediaCard"
import ProductVariantCard from "./ProductVariantCard"
import ProductClassificationCard from "./ProductClassificationCard"
import ProductAttributesCard from "./ProductAttributesCard"
import ProductSeoCard from "./ProductSeoCard"
import type {
  ProductResponse,
  CategoryItem,
  BrandItem,
  ProductCreateRequest,
  ProductUpdateRequest
} from "~/shared/types"

export interface ProductFormHandle {
  submit: () => Promise<ProductCreateRequest | ProductUpdateRequest | null>
  reset: () => void
  isDirty: () => boolean
}

export type ProductFormRef = ProductFormHandle

export interface ProductFormProps {
  mode: "create" | "edit"
  initialData?: ProductResponse | null
  categories?: CategoryItem[]
  brands?: BrandItem[]
  onDirtyChange?: (isDirty: boolean) => void
}

const ProductForm = forwardRef<ProductFormHandle, ProductFormProps>(function ProductForm(
  {
    mode,
    initialData,
    categories,
    brands,
    onDirtyChange
  },
  ref
) {
  const { t } = useTranslation()

  // Map initialData from API to Form State if in edit mode
  const defaultValues = useMemo(
    () => getInitialProductFormValues(initialData, mode),
    [initialData, mode]
  )

  // Determine if the product originally had options in DB
  const initialHasOptions = Boolean(initialData?.options && initialData.options.length > 0)
  // If the product was originally a single product in DB, retain its true DB variant ID; otherwise null
  const initialSingleVariantId =
    !initialHasOptions && initialData?.variants?.[0]?.id ? initialData.variants[0].id : null

  // Retain initial variant records so re-enabling multi-variant mode preserves original DB variant IDs
  const initialVariants = useMemo(
    () =>
      (initialData?.variants || []).map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        price: v.price,
        quantity: v.quantity,
        mediaId: v.mediaId || undefined,
        image: v.mediaUrl || initialData?.medias?.find((m) => m.mediaId === v.mediaId)?.url || "",
        productOptionValueIds: v.productOptionValueIds
      })),
    [initialData]
  )

  const methods = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues
  })

  const { handleSubmit, formState, reset } = methods
  const { isDirty } = formState

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useImperativeHandle(
    ref,
    () => ({
      submit: async () => {
        let payload: ProductCreateRequest | ProductUpdateRequest | null = null
        await handleSubmit(
          (values) => {
            payload = transformProductFormToPayload(values, mode)
          },
          (errors) => {
            console.warn("Product form validation errors:", errors)
          }
        )()
        return payload
      },
      reset: () => {
        reset()
      },
      isDirty: () => isDirty
    }),
    [handleSubmit, mode, reset, isDirty]
  )

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* 2-Column Responsive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (8 cols = ~67%) */}
          <div className="lg:col-span-8 space-y-6">
            <ProductGeneralInfoCard />
            <ProductMediaCard />
            <ProductAttributesCard />
            <ProductVariantCard
              initialSingleVariantId={initialSingleVariantId}
              initialVariants={initialVariants}
            />
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
})

export default ProductForm
