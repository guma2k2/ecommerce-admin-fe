import { useState } from "react"
import { useLoaderData, useNavigate, Link } from "react-router"
import type { ClientLoaderFunctionArgs } from "react-router"
import { ArrowLeft, Pencil } from "lucide-react"
import { useTranslation } from "react-i18next"

import CategoryForm from "~/features/authenticate/manageCategory/components/CategoryForm"
import type { CategoryFormSchema } from "~/features/authenticate/manageCategory/validator"
import { getCategoryById, getAllCategories, updateCategory } from "~/shared/services/api/categoryService"
import { showToast } from "~/shared/utils/toast"
import { Button } from "~/core/components/shadcn/button"

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const categoryId = params.id
  if (!categoryId) {
    throw new Error("Category ID is required")
  }
  const [category, categories] = await Promise.all([getCategoryById(categoryId), getAllCategories()])
  return { category, categories }
}

clientLoader.hydrate = true as const

export default function UpdateCategoryPage() {
  const { t } = useTranslation()
  const { category, categories } = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdate = async (values: CategoryFormSchema) => {
    try {
      setIsSubmitting(true)
      await updateCategory(category.id, values)
      showToast("success", "toasts.categoryUpdated")
      navigate("/admin/manage-category")
    } catch (error) {
      console.error("Update category error:", error)
      showToast("error", "toasts.error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Header section */}
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='icon' asChild className='bg-white dark:bg-zinc-900 shadow-xs'>
          <Link to='/admin/manage-category'>
            <ArrowLeft className='size-4' />
            <span className='sr-only'>{t("category.backToCategories")}</span>
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2'>
            <Pencil className='size-6 text-primary' />
            {t("category.updateTitle")}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t("category.updateSubtitle", { id: category.id, name: category.name })}
          </p>
        </div>
      </div>

      {/* Main Form Box */}
      <div className='max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs p-6'>
        <CategoryForm
          defaultValues={{
            name: category.name,
            parentId: category.parentId || "none"
          }}
          categories={categories}
          currentCategoryId={category.id}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/admin/manage-category")}
          submitLabel={t("category.updateCategory")}
        />
      </div>
    </div>
  )
}
