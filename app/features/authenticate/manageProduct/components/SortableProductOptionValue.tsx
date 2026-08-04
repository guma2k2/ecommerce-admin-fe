import { useSortable } from '@dnd-kit/sortable'
import { GripVertical, Trash } from 'lucide-react'
import { useFieldArray, useWatch, type Control, type FieldArrayWithId } from 'react-hook-form'
import FormBase from '~/shared/components/Form'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/core/components/shadcn/input-group'
import { CSS } from '@dnd-kit/utilities'
import type { ProductVariantFormSchema } from '~/features/authenticate/manageProduct/validator'
import { useProductVariantForm } from '~/features/authenticate/manageProduct/contexts/ProductVariantFormContext'
import { useRef } from 'react'
type OptionValueField = FieldArrayWithId<ProductVariantFormSchema, `options.${number}.values`, 'id'>
type SortableProductOptionValueProps = {
  field: OptionValueField
  index: number
  optionIndex: number
  fields: OptionValueField[]
  append: any
  remove: any
}
export default function SortableProductOptionValue({
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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id })
  const isHasTwoValidValues = fields.filter((f: any) => f.value.trim() !== '').length >= 2
  const optionValueLength = fields.length
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className='cursor-grab active:cursor-grabbing'>
      <FormBase control={control} name={`options.${optionIndex}.values.${index}.value`}>
        {(field) => (
          <div className='relative'>
            <GripVertical {...listeners} className='absolute top-1/2 -left-5 -translate-y-1/2' size={16} />
            <InputGroup>
              <InputGroupInput
                {...field}
                onChange={(e) => {
                  if (index === fields.length - 1 && e.target.value.trim() && fields.length === index + 1) {
                    append({ value: '', position: optionValueLength + 1, image: '' }, { shouldFocus: false })
                  }
                  lastKeywordRef.current = field.value ?? ''
                  field.onChange(e)
                }}
                // onFocus={() => {
                //   lastKeywordRef.current = field.value ?? ''
                // }}
                onBlur={(e) => {
                  field.onBlur()
                  console.log(lastKeywordRef.current)
                  console.log(field.value)
                  if (field.value.trim() === '') {
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
