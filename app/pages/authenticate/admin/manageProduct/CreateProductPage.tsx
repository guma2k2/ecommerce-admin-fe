import ProductInformationForm from "~/features/authenticate/manageProduct/components/ProductInformationForm"
import ProductVariantForm from "~/features/authenticate/manageProduct/components/ProductVariantForm"

export default function CreateProductPage() {
  return (
    <div className='w-full bg-gray-100 h-full'>
      <div className='w-5xl mx-auto p-4'>
        <header>Add Product</header>
        <div className='grid grid-cols-[2fr_1fr] gap-5'>
          <div className='space-y-3'>
            <div className='bg-white rounded-lg p-4 h-fit'>
              <ProductInformationForm />
            </div>
            <div className='bg-white rounded-lg p-4 h-fit'>
              <ProductVariantForm />
            </div>
          </div>
          <div className='h-screen bg-white rounded-lg p-4'></div>
        </div>
      </div>
    </div>
  )
}
