import React, { useEffect, useState } from "react"
import { useFormContext, useFieldArray, useWatch } from "react-hook-form"
import { Sliders, Plus, Trash2, Sparkles } from "lucide-react"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/core/components/shadcn/select"
import { getAllProductAttributes } from "~/shared/services/api/productAttributeService"
import { getAllProductAttributeTemplates } from "~/shared/services/api/productAttributeTemplateService"
import type { ProductAttributeItem, ProductAttributeTemplateItem } from "~/shared/types"
import type { ProductFormSchema } from "~/features/authenticate/manageProduct/validator"

export default function ProductAttributesCard() {
  const { control, setValue, getValues } = useFormContext<ProductFormSchema>()
  const attributes = useWatch({ control, name: "attributes" }) || []

  const [availableAttributes, setAvailableAttributes] = useState<ProductAttributeItem[]>([])
  const [templates, setTemplates] = useState<ProductAttributeTemplateItem[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none")

  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute
  } = useFieldArray({
    control,
    name: "attributes"
  })

  useEffect(() => {
    Promise.all([
      getAllProductAttributes(),
      getAllProductAttributeTemplates().catch(() => [])
    ]).then(([attrs, tmpls]) => {
      setAvailableAttributes(attrs)
      setTemplates(tmpls)
    })
  }, [])

  // Handle template selection
  const handleApplyTemplate = (templateId: string) => {
    if (templateId === "none") return
    const tmpl = templates.find((t) => t.id === templateId)
    if (!tmpl) return

    const newAttributes = (tmpl.attributes || []).map((attr, idx) => {
      const numId = typeof attr.id === 'number' ? attr.id : parseInt(String(attr.id).replace(/\D/g, ""), 10) || idx + 100
      return {
        productAttributeId: numId,
        name: attr.name,
        value: ""
      }
    })

    setValue("attributes", newAttributes, { shouldDirty: true })
    setSelectedTemplateId(templateId)
  }

  const handleAddAttribute = () => {
    const nextAttr = availableAttributes[attributeFields.length % availableAttributes.length]
    const numId = nextAttr
      ? typeof nextAttr.id === 'number'
        ? nextAttr.id
        : parseInt(String(nextAttr.id).replace(/\D/g, ""), 10) || 101
      : 101
    appendAttribute({
      productAttributeId: numId,
      name: nextAttr?.name || "Material",
      value: ""
    })
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            Attributes & Specifications
          </h3>
          <p className="text-xs text-muted-foreground">
            Structured product specifications like Material, Origin, Warranty, or Dimensions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {templates.length > 0 && (
            <Select value={selectedTemplateId} onValueChange={handleApplyTemplate}>
              <SelectTrigger className="h-8 w-44 bg-gray-50 dark:bg-zinc-800 text-xs">
                <SelectValue placeholder="Apply Template ▾" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs text-muted-foreground">
                  Choose Template
                </SelectItem>
                {templates.map((tmpl) => (
                  <SelectItem key={tmpl.id} value={tmpl.id} className="text-xs">
                    {tmpl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddAttribute}
            className="h-8 gap-1 text-xs"
          >
            <Plus className="size-3.5" />
            Add Attribute
          </Button>
        </div>
      </div>

      {attributeFields.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-lg bg-gray-50/50 dark:bg-zinc-800/20 text-muted-foreground text-xs">
          No attributes assigned yet. Click "Add Attribute" or select a template above.
        </div>
      ) : (
        <div className="space-y-3">
          {attributeFields.map((field, index) => {
            const currentItem = attributes[index]
            return (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-3 items-center p-2.5 rounded-lg bg-gray-50/50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800"
              >
                {/* Attribute Selector */}
                <div className="col-span-12 sm:col-span-5">
                  <Select
                    value={String(currentItem?.productAttributeId || "")}
                    onValueChange={(val) => {
                      const selected = availableAttributes.find(
                        (a) => String(parseInt(a.id.replace(/\D/g, ""), 10) || a.id) === val || a.id === val
                      )
                      const numVal = parseInt(val, 10) || index + 101
                      setValue(`attributes.${index}.productAttributeId`, numVal)
                      setValue(`attributes.${index}.name`, selected?.name || "Attribute", {
                        shouldDirty: true
                      })
                    }}
                  >
                    <SelectTrigger className="h-8 bg-white dark:bg-zinc-900 text-xs">
                      <SelectValue placeholder="Select attribute" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAttributes.map((attr) => {
                        const numId = parseInt(attr.id.replace(/\D/g, ""), 10) || attr.id
                        return (
                          <SelectItem key={attr.id} value={String(numId)} className="text-xs">
                            {attr.name}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Attribute Value Input */}
                <div className="col-span-10 sm:col-span-6">
                  <Input
                    placeholder="Value (e.g. Mesh & Synthetic, Vietnam, 1 Year)"
                    value={currentItem?.value || ""}
                    onChange={(e) => {
                      setValue(`attributes.${index}.value`, e.target.value, { shouldDirty: true })
                    }}
                    className="h-8 bg-white dark:bg-zinc-900 text-xs"
                  />
                </div>

                {/* Delete Button */}
                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttribute(index)}
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
