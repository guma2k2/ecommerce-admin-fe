import { useState, useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Loader2,
  Plus,
  Trash2,
  Tag,
  SlidersHorizontal,
  XCircle,
  Layers,
  GripVertical
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FormInput } from '~/shared/components/Form'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'
import { FieldGroup } from '~/core/components/shadcn/field'
import InfiniteSelect from '~/shared/components/InfiniteSelect'
import { getProductAttributes } from '~/shared/services/api/productAttributeService'
import type { ProductAttributeItem } from '~/shared/types'
import { cn } from '~/shared/utils/appUtils'
import {
  productAttributeTemplateFormSchema,
  type ProductAttributeTemplateFormSchema
} from '../validator'

interface SortableAttributeItemProps {
  id: string
  index: number
  displayName: string
  isSubmitting?: boolean
  onRemove: (id: string) => void
}

function SortableAttributeItem({
  id,
  index,
  displayName,
  isSubmitting,
  onRemove
}: SortableAttributeItemProps) {
  const { t } = useTranslation()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center justify-between gap-3 p-2.5 px-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-900 transition-all select-none group',
        isDragging && 'shadow-lg border-indigo-500 ring-2 ring-indigo-500/20'
      )}
    >
      {/* Left: Drag Handle, Index, Icon & Attribute Name */}
      <div className='flex items-center gap-2.5 min-w-0'>
        <div
          {...attributes}
          {...listeners}
          className='cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors touch-none'
          title='Drag to reorder'
        >
          <GripVertical className='size-4' />
        </div>

        <span className='size-5 rounded bg-gray-100 dark:bg-zinc-800 text-[11px] font-semibold text-muted-foreground flex items-center justify-center shrink-0'>
          {index + 1}
        </span>

        <div className='flex items-center gap-2 min-w-0'>
          <Tag className='size-3.5 text-indigo-500 shrink-0' />
          <span className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
            {displayName}
          </span>
        </div>

        <Badge variant='outline' className='text-[10px] font-mono text-muted-foreground shrink-0'>
          {id}
        </Badge>
      </div>

      {/* Right: Remove Button */}
      <div className='flex items-center shrink-0'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          disabled={isSubmitting}
          onClick={() => onRemove(id)}
          title={t('productAttributeTemplate.removeAttribute')}
          className='size-7 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors'
        >
          <Trash2 className='size-3.5' />
        </Button>
      </div>
    </div>
  )
}

interface ProductAttributeTemplateFormProps {
  defaultValues?: Partial<ProductAttributeTemplateFormSchema>
  initialAttributes?: ProductAttributeItem[]
  onSubmit: (values: ProductAttributeTemplateFormSchema) => void | Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
  submitLabel?: string
}

export default function ProductAttributeTemplateForm({
  defaultValues = { name: '', attribute_ids: [] },
  initialAttributes = [],
  onSubmit,
  isSubmitting = false,
  onCancel,
  submitLabel
}: ProductAttributeTemplateFormProps) {
  const { t } = useTranslation()

  // Map to store attribute details for display
  const [attributeDetailsMap, setAttributeDetailsMap] = useState<Record<string, ProductAttributeItem>>(() => {
    const initialMap: Record<string, ProductAttributeItem> = {}
    initialAttributes.forEach((attr) => {
      initialMap[attr.id] = attr
    })
    return initialMap
  })

  // Selected attribute in the infinite dropdown before pressing "Add"
  const [selectedAttrId, setSelectedAttrId] = useState<string>('')
  const [selectedAttrItem, setSelectedAttrItem] = useState<ProductAttributeItem | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const form = useForm<ProductAttributeTemplateFormSchema>({
    resolver: zodResolver(productAttributeTemplateFormSchema),
    defaultValues: {
      name: defaultValues.name || '',
      attribute_ids: defaultValues.attribute_ids || []
    }
  })

  const { handleSubmit, control, setValue } = form

  const attributeIds = useWatch({
    control,
    name: 'attribute_ids'
  }) || []

  // Add selected attribute to the template
  const handleAddAttribute = useCallback(() => {
    if (!selectedAttrId) return

    if (!attributeIds.includes(selectedAttrId)) {
      const nextIds = [...attributeIds, selectedAttrId]
      setValue('attribute_ids', nextIds, { shouldValidate: true, shouldDirty: true })

      if (selectedAttrItem) {
        setAttributeDetailsMap((prev) => ({
          ...prev,
          [selectedAttrItem.id]: selectedAttrItem
        }))
      }
    }

    // Reset dropdown selection
    setSelectedAttrId('')
    setSelectedAttrItem(null)
  }, [selectedAttrId, selectedAttrItem, attributeIds, setValue])

  // Remove attribute from template
  const handleRemoveAttribute = useCallback(
    (idToRemove: string) => {
      const nextIds = attributeIds.filter((id) => id !== idToRemove)
      setValue('attribute_ids', nextIds, { shouldValidate: true, shouldDirty: true })
    },
    [attributeIds, setValue]
  )

  // Clear all attached attributes
  const handleClearAll = useCallback(() => {
    setValue('attribute_ids', [], { shouldValidate: true, shouldDirty: true })
  }, [setValue])

  // Drag and Drop reordering handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)

    if (over && active.id !== over.id) {
      const oldIndex = attributeIds.indexOf(String(active.id))
      const newIndex = attributeIds.indexOf(String(over.id))
      if (oldIndex !== -1 && newIndex !== -1) {
        const nextIds = arrayMove(attributeIds, oldIndex, newIndex)
        setValue('attribute_ids', nextIds, { shouldValidate: true, shouldDirty: true })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
      <FieldGroup className='space-y-6'>
        {/* Template Name Field */}
        <FormInput
          control={control}
          name='name'
          label={t('productAttributeTemplate.name')}
          placeholder={t('productAttributeTemplate.namePlaceholder')}
          disabled={isSubmitting}
        />

        {/* Product Attributes Section */}
        <div className='space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800/80'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
            <div className='space-y-0.5'>
              <div className='flex items-center gap-2'>
                <SlidersHorizontal className='size-4 text-indigo-500' />
                <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                  {t('productAttributeTemplate.attributesSection')}
                </h3>
                <Badge variant='secondary' className='text-xs font-semibold px-2 py-0.5'>
                  {t('productAttributeTemplate.attributesCount', { count: attributeIds.length })}
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground'>
                {t('productAttributeTemplate.attributesSubtitle')}
              </p>
            </div>

            {attributeIds.length > 0 && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleClearAll}
                disabled={isSubmitting}
                className='text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 self-start sm:self-auto h-7 px-2'
              >
                <XCircle className='size-3.5 mr-1' />
                {t('productAttributeTemplate.clearAll')}
              </Button>
            )}
          </div>

          {/* Select and Add Control Bar */}
          <div className='flex items-center gap-2 bg-gray-50/80 dark:bg-zinc-800/40 p-3 rounded-lg border border-gray-200/80 dark:border-zinc-800'>
            <div className='flex-1 min-w-0'>
              <InfiniteSelect<ProductAttributeItem>
                fetchData={getProductAttributes}
                value={selectedAttrId}
                onChange={(val, item) => {
                  setSelectedAttrId(val)
                  if (item) setSelectedAttrItem(item)
                }}
                disabled={isSubmitting}
                disabledOptionIds={attributeIds}
                disabledOptionBadge={t('productAttributeTemplate.alreadyAdded')}
                placeholder={t('productAttributeTemplate.selectAttributePlaceholder')}
                searchPlaceholder={t('productAttributeTemplate.searchAttributePlaceholder')}
                pageSize={10}
                renderOption={(item, _, isItemDisabled) => (
                  <div className='flex items-center justify-between w-full pr-2'>
                    <div className='flex items-center gap-2 min-w-0'>
                      <Tag className='size-3.5 text-indigo-500 shrink-0' />
                      <span className='font-medium truncate'>{item.name}</span>
                    </div>
                    <span className='text-[11px] font-mono text-muted-foreground shrink-0 ml-2'>
                      {item.id}
                    </span>
                  </div>
                )}
              />
            </div>

            <Button
              type='button'
              onClick={handleAddAttribute}
              disabled={!selectedAttrId || isSubmitting}
              className='gap-1.5 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700'
            >
              <Plus className='size-4' />
              {t('productAttributeTemplate.addAttribute')}
            </Button>
          </div>

          {/* Selected Attributes List Display with Drag and Drop */}
          <div className='space-y-2'>
            {attributeIds.length === 0 ? (
              <div className='flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-gray-200 dark:border-zinc-800 text-center bg-gray-50/30 dark:bg-zinc-900/20'>
                <div className='size-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 mb-2'>
                  <Layers className='size-5' />
                </div>
                <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                  {t('productAttributeTemplate.noAttributesSelected')}
                </p>
                <p className='text-xs text-muted-foreground max-w-sm mt-1'>
                  {t('productAttributeTemplate.noAttributesSelectedDesc')}
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={attributeIds} strategy={verticalListSortingStrategy}>
                  <div className='space-y-1.5'>
                    {attributeIds.map((attrId, index) => {
                      const details = attributeDetailsMap[attrId]
                      const displayName = details?.name || attrId

                      return (
                        <SortableAttributeItem
                          key={attrId}
                          id={attrId}
                          index={index}
                          displayName={displayName}
                          isSubmitting={isSubmitting}
                          onRemove={handleRemoveAttribute}
                        />
                      )
                    })}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeDragId ? (
                    <div className='flex items-center justify-between gap-3 p-2.5 px-3 rounded-lg border-2 border-indigo-500 bg-white dark:bg-zinc-900 shadow-xl ring-4 ring-indigo-500/10 cursor-grabbing opacity-95'>
                      <div className='flex items-center gap-2.5 min-w-0'>
                        <GripVertical className='size-4 text-indigo-500' />
                        <span className='size-5 rounded bg-indigo-50 dark:bg-indigo-950 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0'>
                          {attributeIds.indexOf(activeDragId) + 1}
                        </span>
                        <div className='flex items-center gap-2 min-w-0'>
                          <Tag className='size-3.5 text-indigo-500 shrink-0' />
                          <span className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                            {attributeDetailsMap[activeDragId]?.name || activeDragId}
                          </span>
                        </div>
                        <Badge variant='outline' className='text-[10px] font-mono text-muted-foreground shrink-0'>
                          {activeDragId}
                        </Badge>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>
      </FieldGroup>

      {/* Form Action Buttons */}
      <div className='flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800'>
        {onCancel && (
          <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
            {t('button.cancel')}
          </Button>
        )}
        <Button type='submit' disabled={isSubmitting} className='gap-2'>
          {isSubmitting ? (
            <>
              <Loader2 className='size-4 animate-spin' /> {t('productAttributeTemplate.saving')}
            </>
          ) : (
            submitLabel || t('productAttributeTemplate.saveTemplate')
          )}
        </Button>
      </div>
    </form>
  )
}


