import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { ArrowLeft, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import ProductAttributeForm from '~/features/authenticate/manageProductAttribute/components/ProductAttributeForm'
import type { ProductAttributeFormSchema } from '~/features/authenticate/manageProductAttribute/validator'
import { createProductAttribute } from '~/shared/services/api/productAttributeService'
import { showToast } from '~/shared/utils/toast'
import { Button } from '~/core/components/shadcn/button'

export default function CreateProductAttributePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (values: ProductAttributeFormSchema) => {
    try {
      setIsSubmitting(true)
      await createProductAttribute({ name: values.name })
      showToast('success', 'toasts.attributeCreated')
      navigate('/admin/manage-product-attribute')
    } catch (error: any) {
      console.error('Create product attribute error:', error)
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
          <Link to='/admin/manage-product-attribute'>
            <ArrowLeft className='size-4' />
            <span className='sr-only'>{t('productAttribute.backToAttributes')}</span>
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2'>
            <Tag className='size-6 text-emerald-500' />
            {t('productAttribute.addNew')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('productAttribute.addSubtitle')}
          </p>
        </div>
      </div>

      {/* Main Form Box */}
      <div className='max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs p-6'>
        <ProductAttributeForm
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/admin/manage-product-attribute')}
          submitLabel={t('productAttribute.createAttribute')}
        />
      </div>
    </div>
  )
}
