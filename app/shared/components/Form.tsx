import { SelectContent } from '@radix-ui/react-select'
import type { ReactNode } from 'react'
import { Controller, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form'
import { Checkbox } from '~/core/components/shadcn/checkbox'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '~/core/components/shadcn/field'
import { Input } from '~/core/components/shadcn/input'
import { Select, SelectTrigger, SelectValue } from '~/core/components/shadcn/select'
import { Textarea } from '~/core/components/shadcn/textarea'

type FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = {
  name: TName
  label?: ReactNode
  description?: ReactNode
  control: ControllerProps<TFieldValues, TName, TTransformedValues>['control']
}

type FormBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = FormControlProps<TFieldValues, TName, TTransformedValues> & {
  horizontal?: boolean
  controlFirst?: boolean
  children: (
    field: Parameters<ControllerProps<TFieldValues, TName, TTransformedValues>['render']>[0]['field'] & {
      'aria-invalid': boolean
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
        const control = children({ ...field, id: field.name, 'aria-invalid': fieldState.invalid })
        const errorElement = fieldState.invalid && <FieldError errors={[fieldState.error]} />

        return (
          <Field data-invalid={fieldState.invalid} orientation={horizontal ? 'horizontal' : undefined}>
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
  Omit<React.ComponentProps<typeof Input>, 'name' | 'value' | 'defaultValue'> & {
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

export const FormSelect: FormControlFunc<{ children: ReactNode }> = ({ children, ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, onBlur, ...field }) => (
        <Select {...field} onValueChange={onChange}>
          <SelectTrigger aria-invalid={field['aria-invalid']} id={field.id} onBlur={onBlur}>
            <SelectValue />
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
