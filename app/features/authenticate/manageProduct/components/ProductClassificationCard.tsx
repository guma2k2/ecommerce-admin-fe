import React, { useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { FolderTree, Tag, Eye, Layers } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/core/components/shadcn/select"
import { getAllCategories } from "~/shared/services/api/categoryService"
import { getAllBrands } from "~/shared/services/api/brandService"
import type { CategoryItem, BrandItem } from "~/shared/types"
import type { ProductFormSchema } from "~/features/authenticate/manageProduct/validator"
import { cn } from "~/shared/utils/appUtils"

interface ProductClassificationCardProps {
  categories?: CategoryItem[]
  brands?: BrandItem[]
}

export default function ProductClassificationCard({
  categories: initialCategories,
  brands: initialBrands
}: ProductClassificationCardProps) {
  const { control, setValue } = useFormContext<ProductFormSchema>()
  const selectedCategoryId = useWatch({ control, name: "categoryId" })
  const selectedBrandId = useWatch({ control, name: "brandId" })
  const status = useWatch({ control, name: "status" }) || "ACTIVE"

  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories || [])
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands || [])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!initialCategories || !initialBrands) {
      setIsLoading(true)
      Promise.all([
        initialCategories ? Promise.resolve(initialCategories) : getAllCategories(),
        initialBrands ? Promise.resolve(initialBrands) : getAllBrands()
      ])
        .then(([cats, brs]) => {
          setCategories(cats)
          setBrands(brs)
        })
        .catch((err) => console.error("Error loading classification:", err))
        .finally(() => setIsLoading(false))
    }
  }, [initialCategories, initialBrands])

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 space-y-5 shadow-xs">
      {/* 1. Status & Visibility */}
      <div className="space-y-2.5 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="size-3.5 text-primary" />
          Status & Visibility
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setValue("status", "ACTIVE", { shouldDirty: true })}
            className={cn(
              "p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all",
              status === "ACTIVE"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active
          </button>

          <button
            type="button"
            onClick={() => setValue("status", "DRAFT", { shouldDirty: true })}
            className={cn(
              "p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all",
              status === "DRAFT"
                ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 ring-1 ring-amber-500/30"
                : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Draft
          </button>
        </div>
      </div>

      {/* 2. Category Hierarchy */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <FolderTree className="size-3.5 text-primary" />
          Category
        </label>
        <Select
          value={selectedCategoryId ? String(selectedCategoryId) : "none"}
          onValueChange={(val) => {
            const numVal = val === "none" ? null : isNaN(Number(val)) ? val : Number(val)
            setValue("categoryId", numVal, { shouldDirty: true })
          }}
        >
          <SelectTrigger className="w-full h-9 bg-gray-50/50 dark:bg-zinc-800/40 text-xs">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="none" className="text-xs text-muted-foreground">
              -- None (Uncategorized) --
            </SelectItem>
            {categories.map((cat) => {
              const hierarchyLabel = cat.parent ? `${cat.parent.name} › ${cat.name}` : cat.name
              return (
                <SelectItem key={cat.id} value={String(cat.id)} className="text-xs">
                  {hierarchyLabel}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          Parent hierarchies are automatically associated on save.
        </p>
      </div>

      {/* 3. Brand Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="size-3.5 text-primary" />
          Brand
        </label>
        <Select
          value={selectedBrandId ? String(selectedBrandId) : "none"}
          onValueChange={(val) => {
            const numVal = val === "none" ? null : isNaN(Number(val)) ? val : Number(val)
            setValue("brandId", numVal, { shouldDirty: true })
          }}
        >
          <SelectTrigger className="w-full h-9 bg-gray-50/50 dark:bg-zinc-800/40 text-xs">
            <SelectValue placeholder="Select Brand" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="none" className="text-xs text-muted-foreground">
              -- None (No Brand) --
            </SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={String(brand.id)} className="text-xs">
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
