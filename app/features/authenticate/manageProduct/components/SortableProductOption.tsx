import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useEffect } from 'react'
import { useWatch, type FieldArrayWithId } from 'react-hook-form'
import { FormInput } from '~/shared/components/Form'
import { Badge } from '~/core/components/shadcn/badge'
import { Button } from '~/core/components/shadcn/button'
import { FieldContent } from '~/core/components/shadcn/field'
import ProductOptionValueForm from '~/features/authenticate/manageProduct/components/ProductOptionValueForm'
import { useProductVariantForm } from '~/features/authenticate/manageProduct/contexts/ProductVariantFormContext'
import type { ProductVariantFormSchema } from '~/features/authenticate/manageProduct/validator'
import { cn } from '~/shared/utils/appUtils'
type OptionField = FieldArrayWithId<ProductVariantFormSchema, 'options', 'id'>

type SortableProductOptionProps = {
  field: OptionField
  index: number
}
export default function SortableProductOption({ field, index }: SortableProductOptionProps) {
  const { updateOption, removeOption, control } = useProductVariantForm()
  const option = useWatch({
    control,
    name: `options.${index}`
  })
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1
  }

  if (!option) return null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'border-b border-b-gray-200 p-3 space-y-2 pl-12 relative z-50',
        !field.showing && 'hover:bg-gray-100'
      )}
      key={field.id}
      onClick={(e) => {
        e.stopPropagation()
        if (!option.showing) {
          updateOption(index, { ...option, showing: true })
        }
      }}
    >
      <GripVertical {...listeners} className='absolute top-5 left-5 cursor-grab active:cursor-grabbing' size={16} />
      {option.showing && !isDragging ? (
        <>
          <FieldContent>
            <FormInput control={control} name={`options.${index}.name`} label={'Option name'} />
          </FieldContent>
          <ProductOptionValueForm optionIndex={index} />
          <div className='flex justify-between'>
            <Button size={'sm'} variant={'destructive'} onClick={() => removeOption(index)}>
              Delete
            </Button>
            <Button size={'sm'} onClick={() => updateOption(index, { ...option, showing: false })}>
              Done
            </Button>
          </div>
        </>
      ) : (
        <div className='space-y-2 '>
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
      )}
    </div>
  )
}
