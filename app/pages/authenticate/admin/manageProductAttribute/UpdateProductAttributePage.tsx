import { useState } from 'react'
import { useLoaderData, useNavigate, Link } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import ProductAttributeForm from '~/features/authenticate/manageProductAttribute/components/ProductAttributeForm'
import type { ProductAttributeFormSchema } from '~/features/authenticate/manageProductAttribute/validator'
import {
  getProductAttributeById,
  updateProductAttribute
} from '~/shared/services/api/productAttributeService'
import { showToast } from '~/shared/utils/toast'
import { Button } from '~/core/components/shadcn/button'

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const attributeId = params.id
  if (!attributeId) {
    throw new Error('Product Attribute ID is required')
  }
  const attribute = await getProductAttributeById(attributeId)
  return { attribute }
}

clientLoader.hydrate = true as const

export default function UpdateProductAttributePage() {
  const { t } = useTranslation()
  const { attribute } = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdate = async (values: ProductAttributeFormSchema) => {
    try {
      setIsSubmitting(true)
      await updateProductAttribute(attribute.id, values)
      showToast('success', 'toasts.attributeUpdated')
      navigate('/admin/manage-product-attribute')
    } catch (error) {
      console.error('Update product attribute error:', error)
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
          <Link to='/admin/manage-product-attribute'>
            <ArrowLeft className='size-4' />
            <span className='sr-only'>{t('productAttribute.backToAttributes')}</span>
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2'>
            <Pencil className='size-6 text-emerald-500' />
            {t('productAttribute.updateTitle')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('productAttribute.updateSubtitle', { id: attribute.id, name: attribute.name })}
          </p>
        </div>
      </div>

      {/* Main Form Box */}
      <div className='max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs p-6'>
        <ProductAttributeForm
          defaultValues={{ name: attribute.name }}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/admin/manage-product-attribute')}
          submitLabel={t('productAttribute.updateAttribute')}
        />
      </div>
    </div>
  )
}
