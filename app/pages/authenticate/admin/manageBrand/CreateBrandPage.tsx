import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { ArrowLeft, Award } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import BrandForm from '~/features/authenticate/manageBrand/components/BrandForm'
import type { BrandFormSchema } from '~/features/authenticate/manageBrand/validator'
import { createBrand } from '~/shared/services/api/brandService'
import { showToast } from '~/shared/utils/toast'
import { Button } from '~/core/components/shadcn/button'

export default function CreateBrandPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (values: BrandFormSchema) => {
    try {
      setIsSubmitting(true)
      await createBrand({
        name: values.name,
        description: values.description || null
      })
      showToast('success', 'toasts.brandCreated')
      navigate('/admin/manage-brand')
    } catch (error: any) {
      console.error('Create brand error:', error)
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
          <Link to='/admin/manage-brand'>
            <ArrowLeft className='size-4' />
            <span className='sr-only'>{t('brand.backToBrands')}</span>
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2'>
            <Award className='size-6 text-amber-500' />
            {t('brand.addNew')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('brand.addSubtitle')}
          </p>
        </div>
      </div>

      {/* Main Form Box */}
      <div className='max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs p-6'>
        <BrandForm
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/admin/manage-brand')}
          submitLabel={t('brand.createBrand')}
        />
      </div>
    </div>
  )
}
