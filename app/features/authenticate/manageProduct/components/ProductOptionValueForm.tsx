import React, { useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useFieldArray } from 'react-hook-form'
import { GripVertical } from 'lucide-react'
import { Input } from '~/core/components/shadcn/input'
import SortableProductOptionValue from '~/features/authenticate/manageProduct/components/SortableProductOptionValue'
import { useProductVariantForm } from '~/features/authenticate/manageProduct/contexts/ProductVariantFormContext'

type ProductOptionValueFormProps = {
  optionIndex: number
}

export default function ProductOptionValueForm({ optionIndex }: ProductOptionValueFormProps) {
  const { control } = useProductVariantForm()
  const [activeValueId, setActiveValueId] = useState<string | null>(null)
  const [newValueText, setNewValueText] = useState('')

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `options.${optionIndex}.values`
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveValueId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = fields.findIndex((i) => i.id === active.id)
    const newIndex = fields.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

    const newOrder = arrayMove(fields, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      position: idx + 1
    }))

    replace(newOrder)
  }

  const handleRemoveOptionValue = (valueIndex: number) => {
    remove(valueIndex)
  }

  const handleAddNewValue = () => {
    const trimmed = newValueText.trim()
    if (!trimmed) return
    append({ value: trimmed, position: fields.length + 1, image: '' })
    setNewValueText('')
  }

  const activeField = fields.find((f) => f.id === activeValueId)

  return (
    <div className='space-y-2 pt-1'>
      <label className='text-xs font-medium text-gray-700 dark:text-gray-300 block'>
        Option values
      </label>

      {fields.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => setActiveValueId(e.active.id as string)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveValueId(null)}
        >
          <SortableContext items={fields.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className='space-y-2'>
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
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeField ? (
              <div className='flex items-center gap-2 w-full p-2 bg-white dark:bg-zinc-900 border border-primary/40 rounded-lg shadow-lg'>
                <GripVertical className='size-4 text-primary shrink-0 ml-1' />
                <span className='text-sm font-medium text-gray-900 dark:text-gray-100 px-2'>
                  {activeField.value || 'Value'}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Add another value input */}
      <div className='pl-6 pt-0.5'>
        <Input
          value={newValueText}
          onChange={(e) => setNewValueText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddNewValue()
            }
          }}
          onBlur={handleAddNewValue}
          placeholder='Add another value'
          className='h-9 w-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-2xs focus-visible:ring-1'
        />
      </div>
    </div>
  )
}
