import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { FormInput } from "~/shared/components/Form"
import { FieldContent, FieldGroup, FieldLabel } from "~/core/components/shadcn/field"
import { productFormSchema, type ProductFormSchema } from "~/features/authenticate/manageProduct/validator"
import Upload from "~/shared/components/Upload"
import { TextEditor } from "~/shared/components/TextEditor"

export default function ProductInformationForm() {
  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      medias: []
    }
  })
  const { handleSubmit, control, watch, setValue } = form
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "medias"
  })
  const onSubmit = (values: ProductFormSchema) => {}
  const medias = watch("medias")
  const checkedMedias = medias.filter((media) => media.isChecked === true)

  const handleChangeMedia = (values: { url: string; checked: boolean }[]) => {
    setValue(
      "medias",
      values.map((val) => ({ isChecked: val.checked, url: val.url }))
    )
  }

  const handleRemove = () => {
    setValue(
      "medias",
      medias.filter((media) => media.isChecked === false)
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
          <Upload onChange={handleChangeMedia} values={medias} />
        </FieldContent>
      </FieldGroup>
    </form>
  )
}
