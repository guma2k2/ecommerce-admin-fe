import { useState } from 'react'
import { useLoaderData, useNavigate, Link } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import BrandForm from '~/features/authenticate/manageBrand/components/BrandForm'
import type { BrandFormSchema } from '~/features/authenticate/manageBrand/validator'
import { getBrandById, updateBrand } from '~/shared/services/api/brandService'
import { showToast } from '~/shared/utils/toast'
import { Button } from '~/core/components/shadcn/button'

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const brandId = params.id
  if (!brandId) {
    throw new Error('Brand ID is required')
  }
  const brand = await getBrandById(brandId)
  return { brand }
}

clientLoader.hydrate = true as const

export default function UpdateBrandPage() {
  const { t } = useTranslation()
  const { brand } = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdate = async (values: BrandFormSchema) => {
    try {
      setIsSubmitting(true)
      await updateBrand(brand.id, values)
      showToast('success', 'toasts.brandUpdated')
      navigate('/admin/manage-brand')
    } catch (error) {
      console.error('Update brand error:', error)
      showToast('error', 'toasts.error')
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
            <Pencil className='size-6 text-amber-500' />
            {t('brand.updateTitle')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('brand.updateSubtitle', { id: brand.id })}
          </p>
        </div>
      </div>

      {/* Main Form Box */}
      <div className='max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs p-6'>
        <BrandForm
          defaultValues={{ name: brand.name, image: brand.image }}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/admin/manage-brand')}
          submitLabel={t('brand.updateBrand')}
        />
      </div>
    </div>
  )
}
