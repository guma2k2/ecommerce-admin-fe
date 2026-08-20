import type { ReactNode } from "react"
import { Controller, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "~/core/components/shadcn/field"
import { Input } from "~/core/components/shadcn/input"
import { Select, SelectContent, SelectTrigger, SelectValue } from "~/core/components/shadcn/select"
import { Textarea } from "~/core/components/shadcn/textarea"
import FileUpload, { type FileUploadProps } from "~/shared/components/FileUpload"
import InfiniteSelect, { type InfiniteSelectProps } from "~/shared/components/InfiniteSelect"

type FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = {
  name: TName
  label?: ReactNode
  description?: ReactNode
  control: ControllerProps<TFieldValues, TName, TTransformedValues>["control"]
}

type FormBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = FormControlProps<TFieldValues, TName, TTransformedValues> & {
  horizontal?: boolean
  controlFirst?: boolean
  children: (
    field: Parameters<ControllerProps<TFieldValues, TName, TTransformedValues>["render"]>[0]["field"] & {
      "aria-invalid": boolean
      id: string
    }
  ) => ReactNode
}

type FormControlFunc<ExtraProps extends Record<string, unknown> = Record<never, never>> = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
>(
  props: FormControlProps<TFieldValues, TName, TTransformedValues> & ExtraProps
) => ReactNode

export default function FormBase<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
>({
  children,
  control,
  label,
  name,
  description,
  controlFirst,
  horizontal
}: FormBaseProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const labelElement = (
          <>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </>
        )
        const control = children({ ...field, id: field.name, "aria-invalid": fieldState.invalid })
        const errorElement = fieldState.invalid && <FieldError errors={[fieldState.error]} />

        return (
          <Field data-invalid={fieldState.invalid} orientation={horizontal ? "horizontal" : undefined}>
            {controlFirst ? (
              <>
                {control}
                <FieldContent>
                  {labelElement}
                  {errorElement}
                </FieldContent>
              </>
            ) : (
              <>
                <FieldContent>{labelElement}</FieldContent>
                {control}
                {errorElement}
              </>
            )}
          </Field>
        )
      }}
    />
  )
}

export const FormInput: FormControlFunc<
  Omit<React.ComponentProps<typeof Input>, "name" | "value" | "defaultValue"> & {
    onChangeCustom?: (e: React.ChangeEvent<HTMLInputElement>) => void
  }
> = ({ onChangeCustom, type, placeholder, ...props }) => {
  return (
    <FormBase {...props}>
      {(field) => (
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          onChange={(e) => {
            onChangeCustom?.(e)
            field.onChange(e)
          }}
        />
      )}
    </FormBase>
  )
}

export const FormSelect: FormControlFunc<{
  children: ReactNode
  placeholder?: string
  disabled?: boolean
  className?: string
}> = ({ children, placeholder, disabled, className, ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, onBlur, value, ...field }) => (
        <Select {...field} value={value ?? ""} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger
            aria-invalid={field["aria-invalid"]}
            id={field.id}
            onBlur={onBlur}
            className={`w-full ${className || ""}`}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
      )}
    </FormBase>
  )
}

export const FormCheckbox: FormControlFunc = (props) => {
  return (
    <FormBase {...props} horizontal controlFirst>
      {({ onChange, value, ...field }) => <Checkbox {...field} checked={value} onCheckedChange={onChange} />}
    </FormBase>
  )
}

export const FormTextarea: FormControlFunc = (props) => {
  return <FormBase {...props}>{(field) => <Textarea {...field} />}</FormBase>
}

export const FormUpload: FormControlFunc<Omit<FileUploadProps, "value" | "onChange">> = (props) => {
  return (
    <FormBase {...props}>
      {({ onChange, value }) => <FileUpload {...props} value={value} onChange={onChange} />}
    </FormBase>
  )
}

export function FormInfiniteSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem extends Record<string, any> = Record<string, any>
>(
  props: FormControlProps<TFieldValues, TName> &
    Omit<InfiniteSelectProps<TItem>, "value" | "onChange"> & {
      onChangeCustom?: (value: string, item?: TItem) => void
    }
) {
  const { onChangeCustom, ...baseProps } = props
  return (
    <FormBase {...baseProps}>
      {({ onChange, value }) => (
        <InfiniteSelect<TItem>
          {...props}
          value={value ?? ""}
          onChange={(val, item) => {
            onChange(val)
            onChangeCustom?.(val, item)
          }}
        />
      )}
    </FormBase>
  )
}

