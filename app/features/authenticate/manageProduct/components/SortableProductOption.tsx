import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Database, GripVertical } from 'lucide-react'
import { useWatch, type FieldArrayWithId } from 'react-hook-form'
import { Input } from '~/core/components/shadcn/input'
import { Badge } from '~/core/components/shadcn/badge'
import { Button } from '~/core/components/shadcn/button'
import ProductOptionValueForm from '~/features/authenticate/manageProduct/components/ProductOptionValueForm'
import { useProductVariantForm } from '~/features/authenticate/manageProduct/contexts/ProductVariantFormContext'
import type { ProductVariantFormSchema } from '~/features/authenticate/manageProduct/validator'
import { cn } from '~/shared/utils/appUtils'

type OptionField = FieldArrayWithId<ProductVariantFormSchema, 'options', 'id'>

type SortableProductOptionProps = {
  field: OptionField
  index: number
}

function SortableProductOptionComponent({ field, index }: SortableProductOptionProps) {
  const { updateOption, removeOption, control, setValue } = useProductVariantForm()
  const option = useWatch({
    control,
    name: `options.${index}`
  })
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 50 : 1
  }

  if (!option) return null

  const isShowing = option.showing !== false

  // COLLAPSED VIEW
  if (!isShowing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-xs relative flex flex-wrap items-center justify-between gap-3 select-none transition-all',
          isDragging && 'opacity-30 border-dashed border-primary/50'
        )}
      >
        <div className='flex items-center gap-3 flex-1 min-w-0'>
          <button
            type='button'
            {...attributes}
            {...listeners}
            className='text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing p-1 rounded focus:outline-none transition-colors shrink-0 touch-none select-none'
            title='Drag to reorder option'
          >
            <GripVertical className='size-4' />
          </button>

          <div className='space-y-1 min-w-0'>
            <div className='text-sm font-semibold text-gray-900 dark:text-gray-100 truncate'>
              {option.name || 'Untitled Option'}
            </div>

            <div className='flex flex-wrap items-center gap-1.5'>
              {option.values
                ?.filter((v) => v.value.trim())
                .map((val, idx) => (
                  <Badge
                    key={idx}
                    variant='secondary'
                    className='px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700'
                  >
                    {val.value}
                  </Badge>
                ))}
              {(!option.values || option.values.filter((v) => v.value.trim()).length === 0) && (
                <span className='text-xs text-muted-foreground italic'>No values configured</span>
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => updateOption(index, { ...option, showing: true })}
            className='h-8 px-3 text-xs font-medium border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800'
          >
            Edit
          </Button>
        </div>
      </div>
    )
  }

  // EDIT MODE (Image 1 Style)
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs relative transition-all',
        isDragging && 'opacity-30 border-dashed border-primary/50'
      )}
    >
      {/* Option Name Section */}
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between'>
          <label className='text-xs font-medium text-gray-700 dark:text-gray-300'>Option name</label>
          <Database className='size-4 text-gray-600 dark:text-gray-400' />
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            {...attributes}
            {...listeners}
            className='text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing p-1 rounded focus:outline-none transition-colors shrink-0 touch-none select-none'
            title='Drag to reorder option'
          >
            <GripVertical className='size-4' />
          </button>

          <Input
            value={option.name || ''}
            onChange={(e) => setValue(`options.${index}.name`, e.target.value, { shouldDirty: true })}
            placeholder='e.g. Size, Color, Material'
            className='h-9 flex-1 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 shadow-2xs focus-visible:ring-1'
          />
        </div>
      </div>

      {/* Option Values Section */}
      <ProductOptionValueForm optionIndex={index} />

      {/* Bottom Action Bar: Delete (Left) & Done (Right) */}
      <div className='flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800/80'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => removeOption(index)}
          className='text-red-600 dark:text-red-400 border-gray-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900 rounded-lg px-4 h-8 text-xs font-semibold'
        >
          Delete
        </Button>

        <Button
          type='button'
          size='sm'
          onClick={() => updateOption(index, { ...option, showing: false })}
          className='bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg px-5 h-8 text-xs font-semibold shadow-xs'
        >
          Done
        </Button>
      </div>
    </div>
  )
}

export default React.memo(SortableProductOptionComponent)
