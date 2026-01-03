import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useEffect } from 'react'
import { FormInput } from '~/components/Form'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { FieldContent } from '~/components/ui/field'
import ProductOptionValueForm from '~/features/authenticate/manageProduct/components/ProductOptionValueForm'
import { useProductVariantForm } from '~/features/authenticate/manageProduct/contexts/ProductVariantFormContext'
import { cn } from '~/utils/appUtils'

type SortableProductOptionProps = {
  field: any
  index: number
}
export default function SortableProductOption({ field, index }: SortableProductOptionProps) {
  const { getValues, updateOption, setValue, removeOption, control } = useProductVariantForm()
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn('border-b border-b-gray-200 p-3 space-y-2 pl-12 relative', !field.showing && 'hover:bg-gray-100')}
      key={field.id}
      onClick={() => {
        if (!field.showing) {
          updateOption(index, { ...getValues(`options.${index}`), showing: true })
        }
      }}
    >
      <GripVertical {...listeners} className='absolute top-5 left-5 cursor-grab active:cursor-grabbing' size={16} />
      {field.showing ? (
        <>
          <FieldContent>
            <FormInput control={control} name={`options.${index}.name`} label={'Option name'} />
          </FieldContent>
          <ProductOptionValueForm optionIndex={index} />
          <div className='flex justify-between'>
            <Button size={'sm'} variant={'destructive'} onClick={() => removeOption(index)}>
              Delete
            </Button>
            <Button
              size={'sm'}
              onClick={() => updateOption(index, { ...getValues(`options.${index}`), showing: false })}
            >
              Done
            </Button>
          </div>
        </>
      ) : (
        <div className='space-y-2 '>
          <div>{field.name}</div>
          {field.values &&
            field.values.length > 0 &&
            field.values
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
