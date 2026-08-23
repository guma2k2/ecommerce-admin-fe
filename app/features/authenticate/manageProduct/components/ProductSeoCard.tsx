import React, { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Globe, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "~/core/components/shadcn/input"
import { Button } from "~/core/components/shadcn/button"
import type { ProductFormSchema } from "~/features/authenticate/manageProduct/validator"

export default function ProductSeoCard() {
  const { control, setValue } = useFormContext<ProductFormSchema>()
  const [isOpen, setIsOpen] = useState(true)

  const name = useWatch({ control, name: "name" }) || "Product Title"
  const slug = useWatch({ control, name: "slug" }) || "product-handle"
  const metaTitle = useWatch({ control, name: "metaTitle" })
  const metaDescription = useWatch({ control, name: "metaDescription" })
  const metaKeyword = useWatch({ control, name: "metaKeyword" })

  const displayTitle = metaTitle || name || "Product Title"
  const displayDescription =
    metaDescription || "Add a description to see how this product will appear in search engine listings."
  const displayUrl = `https://store.com/products/${slug}`

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            Search Engine Optimization (SEO)
          </h3>
          <p className="text-xs text-muted-foreground">
            Preview and customize how this product appears on Google and social search results.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-8 w-8 p-0"
        >
          {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
      </div>

      {/* Live Google Search Snippet Preview */}
      <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-zinc-800/40 border border-gray-200/80 dark:border-zinc-700/60 space-y-1">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
          Google Search Listing Preview
        </span>
        <div className="text-xs text-emerald-700 dark:text-emerald-400 truncate font-mono">
          {displayUrl}
        </div>
        <div className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
          {displayTitle}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
          {displayDescription}
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-2">
          {/* Page Meta Title */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-gray-700 dark:text-gray-300">Page Title</label>
              <span className="text-[11px] text-muted-foreground">
                {(metaTitle || "").length} / 70 characters
              </span>
            </div>
            <Input
              placeholder={name || "Enter SEO meta title"}
              value={metaTitle || ""}
              onChange={(e) => setValue("metaTitle", e.target.value, { shouldDirty: true })}
              className="bg-gray-50/50 dark:bg-zinc-800/40 text-xs"
            />
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-gray-700 dark:text-gray-300">Meta Description</label>
              <span className="text-[11px] text-muted-foreground">
                {(metaDescription || "").length} / 160 characters
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Enter a brief summary for search engines"
              value={metaDescription || ""}
              onChange={(e) => setValue("metaDescription", e.target.value, { shouldDirty: true })}
              className="w-full rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/40 p-2.5 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Meta Keywords */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Keywords (comma-separated)
            </label>
            <Input
              placeholder="e.g. nike, air max 270, running shoes, sneakers"
              value={metaKeyword || ""}
              onChange={(e) => setValue("metaKeyword", e.target.value, { shouldDirty: true })}
              className="bg-gray-50/50 dark:bg-zinc-800/40 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  )
}
