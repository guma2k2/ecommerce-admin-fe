import React from "react"
import { useLoaderData } from "react-router"
import ProductForm from "~/features/authenticate/manageProduct/components/ProductForm"
import { getAllCategories } from "~/shared/services/api/categoryService"
import { getAllBrands } from "~/shared/services/api/brandService"

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

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6">
      <ProductForm mode="create" categories={categories} brands={brands} />
    </div>
  )
}
