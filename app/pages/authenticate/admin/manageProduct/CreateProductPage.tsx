import { useState, useRef } from "react"
import { useLoaderData, useNavigate } from "react-router"
import {
  ProductForm,
  ProductActionHeader,
  type ProductFormHandle
} from "~/features/authenticate/manageProduct/components"
import { getAllCategories } from "~/shared/services/api/categoryService"
import { getAllBrands } from "~/shared/services/api/brandService"
import { createProduct } from "~/shared/services/api/productService"
import type { ProductCreateRequest } from "~/shared/types"

export async function clientLoader() {
  const [categories, brands] = await Promise.all([
    getAllCategories().catch(() => []),
    getAllBrands().catch(() => [])
  ])
  return { categories, brands }
}

clientLoader.hydrate = true as const

export default function CreateProductPage() {
  const { categories, brands } = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate()
  const formRef = useRef<ProductFormHandle>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const handleSave = async () => {
    const payload = await formRef.current?.submit()
    if (!payload) return
    console.log("Payload: ", payload);
    try {
      setIsSubmitting(true)
      await createProduct(payload as ProductCreateRequest)
      navigate("/admin/manage-product")
    } catch (error: unknown) {
      console.error("Failed to create product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6">
      <ProductActionHeader
        mode="create"
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onSave={handleSave}
      />
      <ProductForm
        ref={formRef}
        mode="create"
        categories={categories}
        brands={brands}
        onDirtyChange={setIsDirty}
      />
    </div>
  )
}
