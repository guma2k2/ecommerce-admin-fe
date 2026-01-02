import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable'
import { GripVertical, Trash } from 'lucide-react'
import { useFieldArray, type Control } from 'react-hook-form'
import FormBase, { FormInput } from '~/components/Form'
import { FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/components/ui/input-group'
import SortableProductOptionValue from '~/features/authenticate/manageProduct/components/SortableProductOptionValue'
import type { ProductVariantFormSchema } from '~/features/authenticate/manageProduct/validator'

type ProductOptionValueFormProps = {
  optionIndex: number
  control: Control<ProductVariantFormSchema>
}
export default function ProductOptionValueForm({ control, optionIndex }: ProductOptionValueFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: `options.${optionIndex}.values`
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((i) => i.id === active.id)
    const newIndex = fields.findIndex((i) => i.id === over.id)
    const newMedias = arrayMove(fields, oldIndex, newIndex)
    // setMedias(newMedias) // Todo
  }
  const renderOptionValue = (field: any, index: number) => {}
  return (
    <div className=''>
      <FieldLabel>Option values</FieldLabel>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((i) => i.id)} strategy={rectSortingStrategy}>
          {fields.map((field, index) => (
            <SortableProductOptionValue
              control={control}
              field={field}
              index={index}
              optionIndex={optionIndex}
              key={field.id}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
