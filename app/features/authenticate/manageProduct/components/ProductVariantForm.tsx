import { zodResolver } from '@hookform/resolvers/zod'
import { Grip, GripVertical, PlusCircle } from 'lucide-react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { FormInput } from '~/components/Form'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { FieldContent } from '~/components/ui/field'
import ProductOptionValueForm from '~/features/authenticate/manageProduct/components/ProductOptionValueForm'
import {
  productVariantFormSchema,
  type ProductVariantFormSchema
} from '~/features/authenticate/manageProduct/validator'
import { cn } from '~/utils/appUtils'

export default function ProductVariantForm() {
  const form = useForm<ProductVariantFormSchema>({
    resolver: zodResolver(productVariantFormSchema),
    defaultValues: {
      options: [],
      variants: []
    }
  })
  const { control, getValues } = form
  const {
    fields: productOptionFields,
    append: appendOption,
    remove: removeOption,
    update: updateOption
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
      <div className='border border-gray-200 rounded-md'>
        {productOptionFields.map((field, index) => (
          <div
            className={cn(
              'border border-b-gray-200 p-3 space-y-2 pl-12 relative',
              !field.showing && 'hover:bg-gray-100'
            )}
            key={field.id}
            onClick={() => {
              if (!field.showing) {
                updateOption(index, { ...getValues(`options.${index}`), showing: true })
              }
            }}
          >
            <GripVertical className='absolute top-5 left-5' size={16} />
            {field.showing ? (
              <>
                <FieldContent>
                  <FormInput control={control} name={`options.${index}.name`} label={'Option name'} />
                </FieldContent>
                <ProductOptionValueForm control={control} optionIndex={index} />
                <div className='flex justify-between'>
                  <Button size={'sm'} variant={'destructive'} onClick={() => removeOption(index)}>
                    Delete
                  </Button>
                  <Button
                    size={'sm'}
                    onClick={() => updateOption(index, { ...getValues(`options.${index}`), showing: false })}
                  >
                    Done
                  </Button>
                </div>
              </>
            ) : (
              <div className='space-y-2 '>
                <div>{field.name}</div>
                {field.values &&
                  field.values.length > 0 &&
                  field.values
                    .filter((item) => item.value.trim() !== '')
                    .map((val, index) => (
                      <Badge key={`${index}-${val}`} variant={'secondary'}>
                        {val.value}
                      </Badge>
                    ))}
              </div>
            )}
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
