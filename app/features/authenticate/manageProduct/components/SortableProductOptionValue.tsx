import { useSortable } from '@dnd-kit/sortable'
import { GripVertical, Trash } from 'lucide-react'
import { useFieldArray } from 'react-hook-form'
import FormBase from '~/components/Form'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/components/ui/input-group'
import { CSS } from '@dnd-kit/utilities'

type SortableProductOptionValueProps = {
  field: any
  index: number
  control: any
  optionIndex: number
}
export default function SortableProductOptionValue({
  field,
  index,
  optionIndex,
  control
}: SortableProductOptionValueProps) {
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: `options.${optionIndex}.values`
  })
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id })
  const isHasTwoValidValues = fields.filter((f: any) => f.value.trim() !== '').length >= 2
  const optionValueLength = fields.length
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='cursor-grab active:cursor-grabbing relative z-21'
    >
      <FormBase control={control} name={`options.${optionIndex}.values.${index}.value`}>
        {(field) => (
          <div className='relative'>
            <GripVertical className='absolute top-1/2 -left-5 -translate-y-1/2' size={16} />
            <InputGroup>
              <InputGroupInput
                {...field}
                onChange={(e) => {
                  if (index === fields.length - 1 && e.target.value.trim() && fields.length === index + 1) {
                    append({ value: '', position: optionValueLength + 1, image: '' }, { shouldFocus: false })
                  }
                  field.onChange(e)
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
