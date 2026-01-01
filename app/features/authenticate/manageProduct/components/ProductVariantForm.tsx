import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle } from 'lucide-react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { FormInput } from '~/components/Form'
import { Button } from '~/components/ui/button'
import { FieldContent } from '~/components/ui/field'
import ProductOptionValueForm from '~/features/authenticate/manageProduct/components/ProductOptionValueForm'
import {
  productVariantFormSchema,
  type ProductVariantFormSchema
} from '~/features/authenticate/manageProduct/validator'

export default function ProductVariantForm() {
  const form = useForm<ProductVariantFormSchema>({
    resolver: zodResolver(productVariantFormSchema),
    defaultValues: {
      options: [],
      variants: []
    }
  })
  const { control } = form
  const {
    fields: productOptionFields,
    append: appendOption,
    remove: removeOption
  } = useFieldArray({
    control: control,
    name: 'options'
  })

  const handleCreateOption = () => {
    const optionLength = productOptionFields.length + 1
    appendOption({ name: '', showing: true, position: optionLength, values: [{ image: '', value: '', position: 1 }] })
  }
  return (
    <div className='space-y-5'>
      <h4>Variants</h4>
      <div className='space-y-3 border-gray-100 rounded-md'>
        {productOptionFields.map((field, index) => (
          <div className='space-y-2'>
            <FieldContent>
              <FormInput control={control} name={`options.${index}.name`} label={'Option name'} />
            </FieldContent>
            <ProductOptionValueForm control={control} optionIndex={index} />
            <div className='flex justify-between'>
              <Button size={'sm'} variant={'destructive'}>
                Delete
              </Button>
              <Button size={'sm'}>Done</Button>
            </div>
          </div>
        ))}
        <Button variant={'ghost'} size={'sm'} onClick={handleCreateOption}>
          <PlusCircle />
          Add options like size or color
        </Button>
      </div>
    </div>
  )
}
