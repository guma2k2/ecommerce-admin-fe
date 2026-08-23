import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormInput } from "~/shared/components/Form"
import { FieldContent, FieldGroup, FieldLabel } from "~/core/components/shadcn/field"
import { productFormSchema, type ProductFormSchema } from "~/features/authenticate/manageProduct/validator"
import Upload from "~/shared/components/MultipleUpload"
import { TextEditor } from "~/shared/components/TextEditor"

export default function ProductInformationForm() {
  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      metaTitle: "",
      metaKeyword: "",
      metaDescription: "",
      categoryId: null,
      brandId: null,
      status: "ACTIVE",
      medias: [],
      attributes: [],
      hasOptions: false,
      simplePrice: 0,
      simpleQuantity: 0,
      simpleSku: "",
      options: [],
      variants: []
    }
  })
  const { handleSubmit, control, watch, setValue } = form
  const onSubmit = (values: ProductFormSchema) => {}
  const medias = watch("medias") || []

  const handleChangeMedia = (values: { url: string; checked: boolean }[]) => {
    setValue(
      "medias",
      values.map((val, idx) => ({
        mediaId: `media-${idx}`,
        position: idx,
        isChecked: val.checked,
        url: val.url
      }))
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FormInput control={control} name='name' label='Title' />
        <FieldContent>
          <FieldLabel>Description</FieldLabel>
          <TextEditor />
        </FieldContent>
        <FieldContent>
          <Upload
            onChange={handleChangeMedia}
            values={medias.map((m) => ({ url: m.url || "", isChecked: !!m.isChecked }))}
          />
        </FieldContent>
      </FieldGroup>
    </form>
  )
}
