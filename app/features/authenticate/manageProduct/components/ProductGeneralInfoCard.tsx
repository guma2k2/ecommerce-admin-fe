import React, { useState, useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Lock, Unlock, Sparkles } from "lucide-react"
import { FormInput } from "~/shared/components/Form"
import { TextEditor } from "~/shared/components/TextEditor"
import { Button } from "~/core/components/shadcn/button"
import { Badge } from "~/core/components/shadcn/badge"
import { generateSlug } from "~/shared/utils"
import type { ProductFormSchema } from "~/features/authenticate/manageProduct/validator"

export default function ProductGeneralInfoCard() {
  const { control, setValue, getValues } = useFormContext<ProductFormSchema>()
  const [isSlugLocked, setIsSlugLocked] = useState(true)
  const name = useWatch({ control, name: "name" })
  const slug = useWatch({ control, name: "slug" })

  // Auto-generate slug when title changes if slug is locked or empty
  useEffect(() => {
    if (isSlugLocked && name) {
      const autoSlug = generateSlug(name)
      setValue("slug", autoSlug, { shouldValidate: true, shouldDirty: true })
    }
  }, [name, isSlugLocked, setValue])

  const handleManualRegenerate = () => {
    const currentName = getValues("name") || ""
    const autoSlug = generateSlug(currentName)
    setValue("slug", autoSlug, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Basic Information
          </h3>
          <p className="text-xs text-muted-foreground">
            Core product details, URL handle, and marketing description.
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-normal bg-gray-50 dark:bg-zinc-800">
          Required Fields *
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Product Title / Name */}
        <div>
          <FormInput
            control={control}
            name="name"
            label="Product Title *"
            placeholder="e.g. Nike Air Max 270 React"
            className="text-base font-medium"
          />
        </div>

        {/* URL Slug Generator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              URL Handle / Slug *
              {isSlugLocked && (
                <span className="text-[11px] text-muted-foreground font-normal">
                  (Auto-synced with title)
                </span>
              )}
            </label>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleManualRegenerate}
                className="h-6 px-2 text-[11px] text-primary gap-1"
              >
                <Sparkles className="size-3" />
                Regenerate
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSlugLocked((prev) => !prev)}
                className="h-6 px-2 text-[11px] text-gray-500 gap-1"
                title={isSlugLocked ? "Unlock to edit manually" : "Lock to auto-sync"}
              >
                {isSlugLocked ? (
                  <>
                    <Lock className="size-3 text-amber-500" />
                    Locked
                  </>
                ) : (
                  <>
                    <Unlock className="size-3 text-emerald-500" />
                    Custom
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/40 px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
            <span className="text-xs text-gray-400 select-none shrink-0 pr-1">
              https://store.com/products/
            </span>
            <input
              type="text"
              value={slug || ""}
              disabled={isSlugLocked}
              onChange={(e) => {
                setValue("slug", generateSlug(e.target.value), {
                  shouldValidate: true,
                  shouldDirty: true
                })
              }}
              placeholder="product-slug-handle"
              className="w-full bg-transparent text-xs font-mono text-gray-800 dark:text-gray-200 outline-none disabled:opacity-75 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Product Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
            <TextEditor />
          </div>
        </div>
      </div>
    </div>
  )
}
