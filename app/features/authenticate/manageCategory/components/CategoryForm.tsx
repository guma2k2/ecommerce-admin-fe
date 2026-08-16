import { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2, FolderTree } from "lucide-react"
import { useTranslation } from "react-i18next"

import { FormInput, FormSelect } from "~/shared/components/Form"
import { SelectItem } from "~/core/components/shadcn/select"
import { Button } from "~/core/components/shadcn/button"
import { FieldGroup } from "~/core/components/shadcn/field"
import type { CategoryItem } from "~/shared/services/api/categoryService"
import { categoryFormSchema, type CategoryFormSchema } from "../validator"

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormSchema>
  categories?: CategoryItem[]
  currentCategoryId?: string
  onSubmit: (values: CategoryFormSchema) => void | Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  submitLabel?: string
}

export default function CategoryForm({
  defaultValues = { name: "", parentId: "none" },
  categories = [],
  currentCategoryId,
  onSubmit,
  isSubmitting = false,
  onCancel,
  submitLabel
}: CategoryFormProps) {
  const { t } = useTranslation()

  const form = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: defaultValues.name || "",
      parentId: defaultValues.parentId || "none"
    }
  })

  const { handleSubmit, control } = form

  // Filter out the current category and its descendants to prevent circular hierarchy
  const availableParentCategories = useMemo(() => {
    if (!currentCategoryId) return categories

    const findDescendantIds = (catId: string): Set<string> => {
      const descendants = new Set<string>([catId])
      let added = true
      while (added) {
        added = false
        categories.forEach((cat) => {
          if (cat.parentId && descendants.has(cat.parentId) && !descendants.has(cat.id)) {
            descendants.add(cat.id)
            added = true
          }
        })
      }
      return descendants
    }

    const invalidIds = findDescendantIds(currentCategoryId)
    return categories.filter((cat) => !invalidIds.has(cat.id))
  }, [categories, currentCategoryId])

  const handleFormSubmit = (values: CategoryFormSchema) => {
    const formattedValues: CategoryFormSchema = {
      name: values.name.trim(),
      parentId: values.parentId === "none" || !values.parentId ? null : values.parentId
    }
    return onSubmit(formattedValues)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      <FieldGroup className='space-y-5'>
        {/* Category Name Field */}
        <FormInput
          control={control}
          name='name'
          label={t("category.name")}
          placeholder={t("category.namePlaceholder")}
          disabled={isSubmitting}
        />

        {/* Parent Category Selector */}
        <FormSelect
          control={control}
          name='parentId'
          label={t("category.parentCategory")}
          placeholder={t("category.parentCategoryPlaceholder")}
          disabled={isSubmitting}
        >
          <SelectItem value='none'>
            <div className='flex items-center gap-2'>
              <span className='font-medium text-muted-foreground'>{t("category.noParent")}</span>
            </div>
          </SelectItem>
          {availableParentCategories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              <div className='flex items-center gap-2'>
                <FolderTree className='size-3.5 text-primary/70' />
                <span>{cat.name}</span>
                {cat.parent && (
                  <span className='text-xs text-muted-foreground'>
                    ({t("category.underParent", { parent: cat.parent.name })})
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </FormSelect>
      </FieldGroup>

      {/* Form Action Buttons */}
      <div className='flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800'>
        {onCancel && (
          <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
            {t("button.cancel")}
          </Button>
        )}
        <Button type='submit' disabled={isSubmitting} className='gap-2'>
          {isSubmitting ? (
            <>
              <Loader2 className='size-4 animate-spin' /> {t("category.saving")}
            </>
          ) : (
            submitLabel || t("category.saveCategory")
          )}
        </Button>
      </div>
    </form>
  )
}
