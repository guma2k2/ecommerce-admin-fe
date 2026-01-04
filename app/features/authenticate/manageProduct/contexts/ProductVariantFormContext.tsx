import React, { useContext, type ReactNode } from 'react'
import type { Control, FieldArrayWithId, UseFieldArrayUpdate, UseFormGetValues, UseFormSetValue } from 'react-hook-form'
import type { ProductVariantFormSchema } from '~/features/authenticate/manageProduct/validator'

type ProductVariantFormContextValue = {
  productOptionFields: FieldArrayWithId<ProductVariantFormSchema, 'options', 'id'>[]
  control: Control<ProductVariantFormSchema>
  getValues: UseFormGetValues<ProductVariantFormSchema>
  setValue: UseFormSetValue<ProductVariantFormSchema>
  updateOption: UseFieldArrayUpdate<ProductVariantFormSchema, 'options'>
  removeOption: (index: number) => void
}

const ProductVariantFormContext = React.createContext<ProductVariantFormContextValue | null>(null)

export function useProductVariantForm() {
  const ctx = useContext(ProductVariantFormContext)
  if (!ctx) {
    throw new Error('useProductVariantForm must be used inside ProductVariantFormProvider')
  }
  return ctx
}

export function ProductVariantFormProvider({
  children,
  value
}: {
  value: ProductVariantFormContextValue
  children: ReactNode
}) {
  return <ProductVariantFormContext.Provider value={value}>{children}</ProductVariantFormContext.Provider>
}
