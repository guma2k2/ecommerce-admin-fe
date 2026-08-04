import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable'
import { useFieldArray, type Control } from 'react-hook-form'
import FormBase, { FormInput } from '~/shared/components/Form'
import { FieldLabel } from '~/core/components/shadcn/field'
import SortableProductOptionValue from '~/features/authenticate/manageProduct/components/SortableProductOptionValue'
import { useProductVariantForm } from '~/features/authenticate/manageProduct/contexts/ProductVariantFormContext'
import type { ProductVariantFormSchema } from '~/features/authenticate/manageProduct/validator'

type ProductOptionValueFormProps = {
  optionIndex: number
}
export default function ProductOptionValueForm({ optionIndex }: ProductOptionValueFormProps) {
  const { control, getValues, setValue } = useProductVariantForm()
  const { fields, append, remove, move, update, replace } = useFieldArray({
    control: control,
    name: `options.${optionIndex}.values`
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((i) => i.id === active.id)
    const newIndex = fields.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    move(oldIndex, newIndex)

    const newOrder = arrayMove(fields, oldIndex, newIndex)
    newOrder.forEach((item, idx) => {
      update(idx, { ...item, position: idx + 1 })
    })
  }

  const handleRemoveOptionValue = (valueIndex: number) => {
    remove(valueIndex)

    const reordered = getValues(`options.${optionIndex}.values`) ?? []

    replace(
      reordered.map((item: any, i: number) => ({
        ...item,
        position: i + 1
      }))
    )
  }
  return (
    <div className=''>
      <FieldLabel>Option values</FieldLabel>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((i) => i.id)} strategy={rectSortingStrategy}>
          {fields.map((field, index) => (
            <SortableProductOptionValue
              key={field.id}
              fields={fields}
              append={append}
              remove={handleRemoveOptionValue}
              field={field}
              index={index}
              optionIndex={optionIndex}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
