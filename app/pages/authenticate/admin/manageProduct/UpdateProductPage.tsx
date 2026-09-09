import { useState, useRef } from "react"
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router"
import {
  ProductForm,
  ProductActionHeader,
  type ProductFormHandle
} from "~/features/authenticate/manageProduct/components"
import { getProductById, updateProduct } from "~/shared/services/api/productService"
import { getAllCategories } from "~/shared/services/api/categoryService"
import { getAllBrands } from "~/shared/services/api/brandService"
import type { ProductUpdateRequest } from "~/shared/types"

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const productId = params.id
  if (!productId) {
    throw new Response("Product ID is required", { status: 400 })
  }

  const [product, categories, brands] = await Promise.all([
    getProductById(productId),
    getAllCategories().catch(() => []),
    getAllBrands().catch(() => [])
  ])
  return { product, categories, brands, productId }
}

clientLoader.hydrate = true as const

export default function UpdateProductPage() {
  const { product, categories, brands, productId } = useLoaderData<typeof clientLoader>()
  const navigate = useNavigate()
  const formRef = useRef<ProductFormHandle>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const handleSave = async () => {
    const payload = await formRef.current?.submit()
    if (!payload) return

    try {
      setIsSubmitting(true)
      const targetId = product?.id || productId
      await updateProduct(targetId, payload as ProductUpdateRequest)
      navigate("/admin/manage-product")
    } catch (error: unknown) {
      console.error("Failed to update product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-6">
      <ProductActionHeader
        mode="edit"
        initialData={product}
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onSave={handleSave}
      />
      <ProductForm
        ref={formRef}
        mode="edit"
        initialData={product}
        categories={categories}
        brands={brands}
        onDirtyChange={setIsDirty}
      />
    </div>
  )
}
