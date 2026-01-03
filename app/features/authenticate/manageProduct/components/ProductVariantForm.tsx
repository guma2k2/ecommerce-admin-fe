import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import FormBase from '~/components/Form'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import SortableProductOption from '~/features/authenticate/manageProduct/components/SortableProductOption'
import { ProductVariantFormProvider } from '~/features/authenticate/manageProduct/contexts/ProductVariantFormContext'
import {
  productVariantFormSchema,
  type ProductVariantFormSchema
} from '~/features/authenticate/manageProduct/validator'
import type { ProductVariant } from '~/types/ProductVariant'
import { cartesian } from '~/utils/appUtils'

export default function ProductVariantForm() {
  const form = useForm<ProductVariantFormSchema>({
    resolver: zodResolver(productVariantFormSchema),
    defaultValues: {
      options: [],
      variants: []
    }
  })
  const { control, getValues, setValue } = form
  const {
    fields: productOptionFields,
    append: appendOption,
    remove: removeOption,
    update: updateOption,
    move
  } = useFieldArray({
    control: control,
    name: 'options'
  })

  const {
    fields: productVariantFields,
    append: appendVariant,
    remove: removeVariant,
    update: updateVariant,
    move: moveVariant
  } = useFieldArray({
    control: control,
    name: 'variants'
  })

  const productOptions = useWatch({ control, name: 'options' })
  const productVariants = useWatch({ control, name: 'variants' })

  const handleCreateOption = () => {
    const optionLength = productOptionFields.length + 1
    appendOption({ name: '', showing: true, position: optionLength, values: [{ image: '', value: '', position: 1 }] })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = productOptionFields.findIndex((i) => i.id === active.id)
    const newIndex = productOptionFields.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    // reorder the field array managed by react-hook-form
    move(oldIndex, newIndex)

    queueMicrotask(() => {
      const reordered = getValues('options') ?? []
      setValue(
        'options',
        reordered.map((item, i) => ({ ...item, position: i + 1 })),
        { shouldDirty: true }
      )
    })
  }

  const handleRemoveOption = (optionIndex: number) => {
    removeOption(optionIndex)
    queueMicrotask(() => {
      const reordered = getValues('options') ?? []
      setValue(
        'options',
        reordered.map((item, i) => ({ ...item, position: i + 1 })),
        { shouldDirty: true }
      )
    })
  }

  const buildVariants = (options: { name: string; values: string[] }[]) => {
    if (!options.length) return []

    const valueMatrix = options.map((o) => o.values)
    const combinations = cartesian(valueMatrix)
    return combinations.map((values) => ({
      image: '',
      name: values.join(' / '),
      price: 0,
      quantity: 0
    }))
  }

  useEffect(() => {
    const normalized = productOptions
      .filter((o) => o.name.trim())
      .map((o) => ({
        name: o.name.trim(),
        values: o.values.map((v) => v.value.trim()).filter(Boolean)
      }))
    const variants = buildVariants(normalized)
    setValue('variants', variants, { shouldDirty: true })
  }, [productOptions])
  return (
    <div className='space-y-5'>
      <h4>Variants</h4>
      <div>{JSON.stringify(productOptions)}</div>
      <div className='border border-gray-200 rounded-md'>
        <ProductVariantFormProvider
          value={{
            control,
            getValues,
            setValue,
            updateOption,
            removeOption: handleRemoveOption
          }}
        >
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={productOptionFields.map((i) => i.id)} strategy={rectSortingStrategy}>
              {productOptionFields.map((field, index) => (
                <SortableProductOption key={field.id} field={field} index={index} />
              ))}
            </SortableContext>
          </DndContext>
        </ProductVariantFormProvider>

        <Button variant={'ghost'} size={'sm'} onClick={handleCreateOption}>
          <PlusCircle />
          Add options like size or color
        </Button>
      </div>
      {productVariants.length > 0 && (
        <div className='space-y-3'>
          <div className='grid grid-cols-12'>
            <div className='col-span-6'>Variant</div>
            <div className='col-span-4'>Price</div>
            <div className='col-span-2'>Available</div>
          </div>

          <div>
            {productVariantFields.map((field, index) => (
              <div className='grid grid-cols-12' key={field.id}>
                <div className='col-span-6'>{field.name}</div>
                <div className='col-span-4'>
                  <FormBase control={control} name={`variants.${index}.price`}>
                    {(field) => <Input {...field} />}
                  </FormBase>
                </div>
                <div className='col-span-2'>
                  <FormBase control={control} name={`variants.${index}.quantity`}>
                    {(field) => <Input {...field} />}
                  </FormBase>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
