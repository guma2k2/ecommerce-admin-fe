import { useFieldArray, type Control } from 'react-hook-form'
import { FormInput } from '~/components/Form'
import { FieldLabel } from '~/components/ui/field'
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
  return (
    <div className=''>
      <FieldLabel>Option values</FieldLabel>
      <div className='space-y-2'>
        {fields.map((field, index) => {
          return <FormInput name={`options.${optionIndex}.values.${index}.value`} control={control} />
        })}
      </div>
    </div>
  )
}
