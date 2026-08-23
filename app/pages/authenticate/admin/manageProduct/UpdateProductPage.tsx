import React from "react"
import { useLoaderData, type LoaderFunctionArgs } from "react-router"
import ProductForm from "~/features/authenticate/manageProduct/components/ProductForm"
import { getProductById } from "~/shared/services/api/productService"
import { getAllCategories } from "~/shared/services/api/categoryService"
import { getAllBrands } from "~/shared/services/api/brandService"

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const productId = params.id || "1"
  const [product, categories, brands] = await Promise.all([
    getProductById(productId),
    getAllCategories().catch(() => []),
    getAllBrands().catch(() => [])
  ])
  return { product, categories, brands }
}

clientLoader.hydrate = true as const

export default function UpdateProductPage() {
  const { product, categories, brands } = useLoaderData<typeof clientLoader>()

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        <ProductForm
          mode="edit"
          initialData={product}
          categories={categories}
          brands={brands}
        />
      </div>
    </div>
  )
}
