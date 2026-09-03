import { useState } from "react"
import { useLoaderData, useNavigate } from "react-router"
import ProductForm from "~/features/authenticate/manageProduct/components/ProductForm"
import { getAllCategories } from "~/shared/services/api/categoryService"
import { getAllBrands } from "~/shared/services/api/brandService"
import { createProduct } from "~/shared/services/api/productService"
import { showToast } from "~/shared/utils/toast"
import type { ProductCreateRequest, ProductUpdateRequest } from "~/shared/types"

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (values: ProductCreateRequest | ProductUpdateRequest) => {
    try {
      setIsSubmitting(true)
      await createProduct(values as ProductCreateRequest)
      showToast("success", "toasts.productCreated")
      navigate("/admin/manage-product")
    } catch (error: unknown) {
      console.error("Failed to create product:", error)
      const errorMsg = (error as { message?: string })?.message || "toasts.error"
      showToast("error", errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6">
      <ProductForm
        mode="create"
        categories={categories}
        brands={brands}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
