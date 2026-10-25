import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import type { UseFormReturn } from "react-hook-form"
import { X, Search } from "lucide-react"
import type { PromotionFormData } from "../validator"
import { getAllCategories } from "~/shared/services/api/categoryService"
import { getAllBrands } from "~/shared/services/api/brandService"
import { getProductsPage } from "~/shared/services/api/productService"
import type { CategoryItem, BrandResponse, ProductItem } from "~/shared/types"
import { Badge } from "~/core/components/shadcn/badge"
import { Input } from "~/core/components/shadcn/input"
import { Button } from "~/core/components/shadcn/button"
import { Skeleton } from "~/core/components/shadcn/skeleton"

interface PromotionTargetCardProps {
  form: UseFormReturn<PromotionFormData>
}

export default function PromotionTargetCard({ form }: PromotionTargetCardProps) {
  const { t } = useTranslation()
  const applyTo = form.watch("applyTo")
  const targetProductIds = form.watch("targetProductIds") || []
  const targetCategoryIds = form.watch("targetCategoryIds") || []
  const targetBrandIds = form.watch("targetBrandIds") || []

  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [brands, setBrands] = useState<BrandResponse[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsLoading(true)
      try {
        if (applyTo === "CATEGORY") {
          const catList = await getAllCategories()
          if (isMounted) setCategories(catList)
        } else if (applyTo === "BRAND") {
          const brandList = await getAllBrands()
          if (isMounted) setBrands(brandList)
        } else if (applyTo === "PRODUCT") {
          const res = await getProductsPage({ pageSize: 50, search: productSearch })
          if (isMounted) setProducts(res.content || [])
        }
      } catch (err) {
        console.error("Failed to load targets:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [applyTo, productSearch])

  const toggleCategory = (id: number) => {
    const current = form.getValues("targetCategoryIds") || []
    if (current.includes(id)) {
      form.setValue(
        "targetCategoryIds",
        current.filter((c) => c !== id),
        { shouldValidate: true }
      )
    } else {
      form.setValue("targetCategoryIds", [...current, id], { shouldValidate: true })
    }
  }

  const toggleBrand = (id: number) => {
    const current = form.getValues("targetBrandIds") || []
    if (current.includes(id)) {
      form.setValue(
        "targetBrandIds",
        current.filter((b) => b !== id),
        { shouldValidate: true }
      )
    } else {
      form.setValue("targetBrandIds", [...current, id], { shouldValidate: true })
    }
  }

  const toggleProduct = (id: number) => {
    const current = form.getValues("targetProductIds") || []
    if (current.includes(id)) {
      form.setValue(
        "targetProductIds",
        current.filter((p) => p !== id),
        { shouldValidate: true }
      )
    } else {
      form.setValue("targetProductIds", [...current, id], { shouldValidate: true })
    }
  }

  return (
    <div className='bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-5 space-y-4'>
      <h3 className='text-base font-semibold text-foreground'>{t("promotion.targetScope", "Target Scope")}</h3>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
        {(["ORDER", "PRODUCT", "CATEGORY", "BRAND"] as const).map((type) => {
          const isSelected = applyTo === type
          return (
            <Button
              key={type}
              type='button'
              variant={isSelected ? "default" : "outline"}
              size='sm'
              onClick={() => {
                form.setValue("applyTo", type, { shouldValidate: true })
              }}
              className='capitalize'
            >
              {type.toLowerCase()}
            </Button>
          )
        })}
      </div>

      {applyTo === "ORDER" && (
        <div className='p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-md text-xs text-muted-foreground'>
          {t("promotion.appliesToOrder", "Applies to entire order subtotal")}
        </div>
      )}

      {applyTo === "CATEGORY" && (
        <div className='space-y-3 pt-2'>
          {isLoading ? (
            <Skeleton className='h-24 w-full' />
          ) : (
            <div className='flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1'>
              {categories.map((cat) => {
                const isSelected = targetCategoryIds.includes(Number(cat.id))
                return (
                  <Badge
                    key={cat.id}
                    variant={isSelected ? "default" : "outline"}
                    className='cursor-pointer text-xs py-1 px-2.5 transition-colors'
                    onClick={() => toggleCategory(Number(cat.id))}
                  >
                    {cat.name}
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
      )}

      {applyTo === "BRAND" && (
        <div className='space-y-3 pt-2'>
          {isLoading ? (
            <Skeleton className='h-24 w-full' />
          ) : (
            <div className='flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1'>
              {brands.map((brand) => {
                const isSelected = targetBrandIds.includes(Number(brand.id))
                return (
                  <Badge
                    key={brand.id}
                    variant={isSelected ? "default" : "outline"}
                    className='cursor-pointer text-xs py-1 px-2.5 transition-colors'
                    onClick={() => toggleBrand(Number(brand.id))}
                  >
                    {brand.name}
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
      )}

      {applyTo === "PRODUCT" && (
        <div className='space-y-3 pt-2'>
          <div className='relative'>
            <Search className='absolute left-3 top-2.5 size-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder={t("promotion.searchProducts", "Search products...")}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className='pl-9'
            />
          </div>

          {isLoading ? (
            <Skeleton className='h-24 w-full' />
          ) : (
            <div className='flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1'>
              {products.map((prod) => {
                const isSelected = targetProductIds.includes(Number(prod.id))
                return (
                  <Badge
                    key={prod.id}
                    variant={isSelected ? "default" : "outline"}
                    className='cursor-pointer text-xs py-1 px-2.5 transition-colors gap-1'
                    onClick={() => toggleProduct(Number(prod.id))}
                  >
                    <span>{prod.name}</span>
                    {isSelected && <X className='size-3 ml-0.5' />}
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
