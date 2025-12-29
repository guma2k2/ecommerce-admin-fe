import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { FormInput } from '~/components/Form'
import { Field, FieldContent, FieldGroup, FieldLabel } from '~/components/ui/field'
import { productFormSchema, type ProductFormSchema } from '~/features/authenticate/manageProduct/validator'
import SortableImage from '~/features/authenticate/manageProduct/components/SortableImage'
import Upload from '~/components/Upload'
import { TextEditor } from '~/components/TextEditor'

export default function ProductInformationForm() {
  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      description: '',
      medias: []
    }
  })
  const { handleSubmit, control, watch, setValue } = form
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: 'medias'
  })
  const onSubmit = (values: ProductFormSchema) => {}
  const medias = watch('medias')
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = medias.findIndex((i) => i.id === active.id)
    const newIndex = medias.findIndex((i) => i.id === over.id)
    const newMedias = arrayMove(medias, oldIndex, newIndex)
    setValue('medias', newMedias)
  }
  const renderUpload = (field: any, index: number) => {
    return (
      <Controller
        key={field.id}
        name={`medias.${index}.url`}
        control={control}
        render={({ field: controllerField, fieldState }) => (
          <Field orientation='horizontal' data-invalid={fieldState.invalid}>
            <FieldContent></FieldContent>
          </Field>
        )}
      />
    )
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FormInput control={control} name='title' label='Title' />
        <FieldContent>
          <FieldLabel>Description</FieldLabel>
          <TextEditor />
        </FieldContent>
        <FieldContent>
          <FieldLabel>Media</FieldLabel>
          <div className='w-full min-h-20'>
            <Upload />
          </div>
        </FieldContent>
      </FieldGroup>
    </form>
  )
}
