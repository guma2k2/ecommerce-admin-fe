import React, { useEffect, useMemo, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Sliders, Layers, Box, Sparkles, X, ArrowRight } from "lucide-react"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/core/components/shadcn/select"
import { useAllProductTemplatesQuery } from "~/shared/hooks/queries/useProductTemplateQuery"
import { getTemplateById } from "~/shared/services/api/productAttributeTemplateService"
import type { ProductAttributeResponse } from "~/shared/types"
import type { ProductFormSchema } from "~/features/authenticate/manageProduct/validator"
import { cn } from "~/shared/utils/appUtils"

export default function ProductAttributesCard() {
  const { control, setValue, getValues } = useFormContext<ProductFormSchema>()
  const attributes = useWatch({ control, name: "attributes" }) || []
  const formTemplateId = useWatch({ control, name: "attributeTemplateId" })

  // Use TanStack React Query hook for caching, deduplication, and single-request lifecycle
  const { data: queryTemplates = [], isLoading: isLoadingTemplates } = useAllProductTemplatesQuery()
  const [extraTemplateDetails, setExtraTemplateDetails] = useState<Record<string, ProductAttributeResponse[]>>({})

  // Merge query templates with any dynamically fetched details if fallback is ever needed
  const templates = useMemo(() => {
    return queryTemplates.map((t) => {
      const extraAttrs = extraTemplateDetails[String(t.id)]
      if (extraAttrs && (!t.attributes || t.attributes.length === 0)) {
        return { ...t, attributes: extraAttrs }
      }
      return t
    })
  }, [queryTemplates, extraTemplateDetails])

  // Auto-populate attributes if form has a template ID set but attributes is currently empty
  useEffect(() => {
    if (!formTemplateId || attributes.length > 0 || templates.length === 0) return

    const match = templates.find((t) => String(t.id) === String(formTemplateId))
    if (match && match.attributes && match.attributes.length > 0) {
      const mapped = match.attributes.map((attr, idx) => ({
        productAttributeId: typeof attr.id === "number" ? attr.id : idx + 100,
        name: attr.name,
        value: "",
        applyTo: "base" as const
      }))
      setValue("attributes", mapped, { shouldDirty: false })
    }
  }, [formTemplateId, attributes.length, templates, setValue])

  // Handle template selection
  const handleSelectTemplate = async (templateIdStr: string) => {
    if (!templateIdStr || templateIdStr === "none") {
      setValue("attributeTemplateId", null, { shouldDirty: true })
      setValue("attributes", [], { shouldDirty: true })
      return
    }

    const tmpl = templates.find((t) => String(t.id) === templateIdStr)
    if (!tmpl) return

    setValue("attributeTemplateId", tmpl.id, { shouldDirty: true })

    let templateAttributes = tmpl.attributes || []

    // If template attributes are empty, fetch full template detail as fallback
    if (templateAttributes.length === 0) {
      try {
        const fullDetail = await getTemplateById(tmpl.id)
        if (fullDetail.attributes && fullDetail.attributes.length > 0) {
          templateAttributes = fullDetail.attributes
          setExtraTemplateDetails((prev) => ({
            ...prev,
            [String(tmpl.id)]: fullDetail.attributes
          }))
        }
      } catch (err) {
        console.error("Failed to fetch template detail:", err)
      }
    }

    const existingAttrs = getValues("attributes") || []
    const existingMap = new Map(existingAttrs.map((a) => [Number(a.productAttributeId), a]))

    const newAttributes = templateAttributes.map((attr, idx) => {
      const numId = typeof attr.id === "number" ? attr.id : parseInt(String(attr.id).replace(/\D/g, ""), 10) || idx + 100
      const existing = existingMap.get(numId)
      return {
        productAttributeId: numId,
        name: attr.name,
        value: existing?.value || "",
        applyTo: existing?.applyTo || ("base" as const)
      }
    })

    setValue("attributes", newAttributes, { shouldDirty: true, shouldValidate: true })
  }

  const handleToggleApplyTo = (index: number, newTarget: "base" | "variant") => {
    setValue(`attributes.${index}.applyTo`, newTarget, { shouldDirty: true })
  }

  const handleClearTemplate = () => {
    setValue("attributeTemplateId", null, { shouldDirty: true })
    setValue("attributes", [], { shouldDirty: true })
  }

  const selectedTemplate = templates.find((t) => String(t.id) === String(formTemplateId))

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 space-y-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            Attributes & Specifications
          </h3>
          <p className="text-xs text-muted-foreground">
            Select an attribute template to attach specifications to the base product or variant combinations.
          </p>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-2">
          <Select
            value={formTemplateId ? String(formTemplateId) : "none"}
            onValueChange={handleSelectTemplate}
            disabled={isLoadingTemplates}
          >
            <SelectTrigger className="h-8.5 min-w-[210px] bg-gray-50 dark:bg-zinc-800/80 text-xs border-gray-200 dark:border-zinc-700">
              <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select Attribute Template"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs text-muted-foreground">
                — No Template (None) —
              </SelectItem>
              {templates.map((tmpl) => (
                <SelectItem key={String(tmpl.id)} value={String(tmpl.id)} className="text-xs font-medium">
                  {tmpl.name}
                  {tmpl.attributes && tmpl.attributes.length > 0 && (
                    <span className="text-muted-foreground ml-1.5 text-[11px]">
                      ({tmpl.attributes.length} {tmpl.attributes.length === 1 ? "attr" : "attrs"})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {formTemplateId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearTemplate}
              className="h-8.5 px-2 text-xs text-muted-foreground hover:text-red-500"
              title="Clear template"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {attributes.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed rounded-xl bg-gray-50/50 dark:bg-zinc-800/20 text-muted-foreground space-y-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Sparkles className="size-5" />
          </div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            No attribute template selected
          </p>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            Choose an attribute template above to automatically load specifications (e.g. Dimensions, Material, Warranty) and assign them to the base product or variants.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-1 px-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Template: <span className="text-primary font-semibold">{selectedTemplate?.name || (formTemplateId ? `#${formTemplateId}` : "Custom / Loaded Attributes")}</span>
            </span>
            <span className="text-[11px]">
              {attributes.filter((a) => a.applyTo !== "variant").length} Base Product •{" "}
              {attributes.filter((a) => a.applyTo === "variant").length} Variant-specific
            </span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-zinc-800/80 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
            {attributes.map((attr, index) => {
              const isVariant = attr.applyTo === "variant"

              return (
                <div
                  key={attr.productAttributeId || index}
                  className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  {/* Left: Attribute Name & ID */}
                  <div className="flex items-center gap-2.5 min-w-[180px] shrink-0">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs transition-colors",
                        isVariant
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                          : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {isVariant ? <Layers className="size-3.5" /> : <Box className="size-3.5" />}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {attr.name || `Attribute #${attr.productAttributeId}`}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Target Selector (Base Product vs Variant) */}
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/90 p-0.5 rounded-lg shrink-0 border border-gray-200 dark:border-zinc-700/60">
                    <button
                      type="button"
                      onClick={() => handleToggleApplyTo(index, "base")}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all select-none",
                        !isVariant
                          ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-2xs font-semibold"
                          : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      )}
                    >
                      <Box className="size-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Base Product</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleApplyTo(index, "variant")}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all select-none",
                        isVariant
                          ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 shadow-2xs font-semibold"
                          : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      )}
                    >
                      <Layers className="size-3 text-indigo-600 dark:text-indigo-400" />
                      <span>Variant</span>
                    </button>
                  </div>

                  {/* Right: Value input or Variant status badge */}
                  <div className="flex-1 max-w-md w-full">
                    {!isVariant ? (
                      <Input
                        placeholder={`Value for base product (e.g. 100% Cotton, Vietnam)`}
                        value={attr.value || ""}
                        onChange={(e) => {
                          setValue(`attributes.${index}.value`, e.target.value, { shouldDirty: true })
                        }}
                        className="h-8.5 bg-gray-50/50 dark:bg-zinc-800/50 text-xs border-gray-200 dark:border-zinc-700"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 rounded-lg px-3 py-1.5">
                        <ArrowRight className="size-3.5 shrink-0 text-indigo-500" />
                        <span className="text-[11px] font-medium">
                          Configured per variant in the variants matrix below
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
