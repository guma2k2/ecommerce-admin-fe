import { useState } from "react"
import { useLoaderData, useNavigate, Link } from "react-router"
import type { ClientLoaderFunctionArgs } from "react-router"
import { ArrowLeft, Tag } from "lucide-react"
import { useTranslation } from "react-i18next"

import { PromotionForm } from "~/features/authenticate/managePromotion"
import { getPromotionById, updatePromotion } from "~/shared/services/api/promotionService"
import type { UpdatePromotionRequest } from "~/shared/types"
import { Button } from "~/core/components/shadcn/button"

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const { id } = params
  if (!id) {
    throw new Response("Promotion ID is required", { status: 400 })
  }
  const promotion = await getPromotionById(id)
  return { promotion }
}

clientLoader.hydrate = true as const

export default function UpdatePromotionPage() {
  const { t } = useTranslation()
  const { promotion } = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdate = async (payload: UpdatePromotionRequest) => {
    try {
      setIsSubmitting(true)
      await updatePromotion(promotion.id, payload)
      navigate("/admin/manage-promotion")
    } catch (error) {
      console.error("Update promotion error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6'>
      {/* Header section */}
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='icon' asChild className='bg-white dark:bg-zinc-900 shadow-xs'>
          <Link to='/admin/manage-promotion'>
            <ArrowLeft className='size-4' />
            <span className='sr-only'>{t("button.back", "Back")}</span>
          </Link>
        </Button>
        <div className='flex items-center gap-2'>
          <Tag className='size-6 text-primary' />
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>{promotion.name}</h1>
        </div>
      </div>

      {/* Main Form Box */}
      <div className='max-w-4xl'>
        <PromotionForm
          defaultValues={promotion}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/admin/manage-promotion")}
          isEdit
        />
      </div>
    </div>
  )
}
