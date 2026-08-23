import { GripVertical } from 'lucide-react'
import { useWatch } from 'react-hook-form'
import { Badge } from '~/core/components/shadcn/badge'
import { useProductVariantForm } from '~/features/authenticate/manageProduct/contexts/ProductVariantFormContext'
import { cn } from '~/shared/utils/appUtils'

type ProductOptionDragPreviewProps = {
  optionId: string
}
export default function ProductOptionDragPreview({ optionId }: ProductOptionDragPreviewProps) {
  const { control, productOptionFields } = useProductVariantForm()
  const index = productOptionFields.findIndex((f) => f.id === optionId)

  const option = useWatch({
    control,
    name: `options.${index}`
  })

  if (index === -1 || !option) return null
  return (
    <div className={cn('border-2 border-blue-500 p-3 space-y-2 pl-12 relative z-51 bg-white rounded-md')}>
      <GripVertical className='absolute top-5 left-5 ' size={16} />
      <div className='space-y-2 w-full'>
        <div>{option.name}</div>
        {option.values &&
          option.values.length > 0 &&
          option.values
            .filter((item: any) => item.value.trim() !== '')
            .map((val: any, index: any) => (
              <Badge key={`${index}-${val}`} variant={'secondary'}>
                {val.value}
              </Badge>
            ))}
      </div>
    </div>
  )
}
