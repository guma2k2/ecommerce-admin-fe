import { useState } from 'react'
import { useNavigate, Link, useLoaderData } from 'react-router'
import { ArrowLeft, FolderPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import CategoryForm from '~/features/authenticate/manageCategory/components/CategoryForm'
import { createCategory, getAllCategories } from '~/shared/services/api/categoryService'
import { showToast } from '~/shared/utils/toast'
import { Button } from '~/core/components/shadcn/button'

export async function clientLoader() {
  const categories = await getAllCategories()
  return { categories }
}

clientLoader.hydrate = true as const

export default function CreateCategoryPage() {
  const { t } = useTranslation()
  const { categories } = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (values: { name: string; parentId: number | null }) => {
    try {
      setIsSubmitting(true)
      await createCategory(values)
      showToast('success', 'toasts.categoryCreated')
      navigate('/admin/manage-category')
    } catch (error: any) {
      console.error('Create category error:', error)
      const errorMsg = error?.response?.data?.message || 'toasts.error'
      showToast('error', errorMsg)
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
            <span className='sr-only'>{t('category.backToCategories')}</span>
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2'>
            <FolderPlus className='size-6 text-primary' />
            {t('category.addNew')}
          </h1>
          <p className='text-sm text-muted-foreground'>{t('category.addSubtitle')}</p>
        </div>
      </div>

      {/* Main Form Box */}
      <div className='max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs p-6'>
        <CategoryForm
          categories={categories}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/admin/manage-category')}
          submitLabel={t('category.createCategory')}
        />
      </div>
    </div>
  )
}
