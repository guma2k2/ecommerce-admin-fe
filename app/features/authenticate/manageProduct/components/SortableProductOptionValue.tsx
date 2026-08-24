import React, { useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { GripVertical, Trash } from 'lucide-react'
import { useWatch, type FieldArrayWithId } from 'react-hook-form'
import FormBase from '~/shared/components/Form'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/core/components/shadcn/input-group'
import { CSS } from '@dnd-kit/utilities'
import type { ProductVariantFormSchema } from '~/features/authenticate/manageProduct/validator'
import { useProductVariantForm } from '~/features/authenticate/manageProduct/contexts/ProductVariantFormContext'
import { cn } from '~/shared/utils/appUtils'

type OptionValueField = FieldArrayWithId<ProductVariantFormSchema, `options.${number}.values`, 'id'>
type SortableProductOptionValueProps = {
  field: OptionValueField
  index: number
  optionIndex: number
  fields: OptionValueField[]
  append: any
  remove: any
}

function SortableProductOptionValueComponent({
  field,
  index,
  optionIndex,
  fields,
  append,
  remove
}: SortableProductOptionValueProps) {
  const { control, setValue } = useProductVariantForm()
  const lastKeywordRef = useRef('')
  const keyword = useWatch({ control: control, name: `options.${optionIndex}.values.${index}.value` })
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })
  const isHasTwoValidValues = fields.filter((f: any) => f.value && f.value.trim() !== '').length >= 2
  const optionValueLength = fields.length
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.3 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className={cn("select-none", isDragging && "opacity-40")}>
      <FormBase control={control} name={`options.${optionIndex}.values.${index}.value`}>
        {(formField) => (
          <div className='relative'>
            <button
              type="button"
              {...attributes}
              {...listeners}
              className='absolute top-1/2 -left-6 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 rounded touch-none select-none focus:outline-none'
              title="Drag to reorder"
            >
              <GripVertical size={16} />
            </button>
            <InputGroup>
              <InputGroupInput
                {...formField}
                onChange={(e) => {
                  if (index === fields.length - 1 && e.target.value.trim() && fields.length === index + 1) {
                    append({ value: '', position: optionValueLength + 1, image: '' }, { shouldFocus: false })
                  }
                  lastKeywordRef.current = formField.value ?? ''
                  formField.onChange(e)
                }}
                onBlur={() => {
                  formField.onBlur()
                  if (formField.value && formField.value.trim() === '') {
                    setValue(`options.${optionIndex}.values.${index}.value`, lastKeywordRef.current, {
                      shouldDirty: false,
                      shouldTouch: false
                    })
                  }
                }}
              />
              {isHasTwoValidValues && index !== optionValueLength - 1 && (
                <InputGroupAddon align={'inline-end'}>
                  <InputGroupButton size={'icon-xs'} onClick={() => remove(index)}>
                    <Trash />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        )}
      </FormBase>
    </div>
  )
}

export default React.memo(SortableProductOptionValueComponent)
