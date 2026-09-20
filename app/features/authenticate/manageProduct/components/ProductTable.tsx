import * as React from "react"
import { PackageX, Image as ImageIcon } from "lucide-react"
import type { ProductItem } from "~/shared/services/api/productService"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/core/components/shadcn/table"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import { Skeleton } from "~/core/components/shadcn/skeleton"
import { formatDateTime, cn } from "~/shared/utils/appUtils"

interface ProductTableProps {
  products: ProductItem[]
  isLoading?: boolean
  selectedIds?: (string | number)[]
  onToggleSelect?: (id: string | number) => void
  onToggleSelectAll?: () => void
  onEdit?: (product: ProductItem) => void
}

export default function ProductTable({
  products,
  isLoading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onEdit
}: ProductTableProps) {
  const isAllSelected = products.length > 0 && products.every((product) => selectedIds.includes(product.id))
  const isSomeSelected = products.some((product) => selectedIds.includes(product.id)) && !isAllSelected

  if (isLoading) {
    return (
      <div className='rounded-md border border-gray-200 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden'>
        <Table>
          <TableHeader className='bg-gray-50/80 dark:bg-zinc-800/50'>
            <TableRow>
              <TableHead className='w-[48px] px-4'>
                <Skeleton className='h-4 w-4 rounded-[4px]' />
              </TableHead>
              <TableHead className='w-[80px]'>Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead className='w-[110px] text-right'>Price ($)</TableHead>
              <TableHead className='w-[160px]'>Created At</TableHead>
              <TableHead className='w-[160px]'>Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className='w-[48px] px-4'>
                  <Skeleton className='h-4 w-4 rounded-[4px]' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-12 w-12 rounded-md' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-48 rounded-md' />
                </TableCell>
                <TableCell className='text-right'>
                  <Skeleton className='h-5 w-16 ml-auto rounded-md' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-28 rounded-md' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-28 rounded-md' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className='rounded-md border border-gray-200 bg-white dark:bg-zinc-900 shadow-2xs p-12 text-center'>
        <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400'>
          <PackageX className='h-8 w-8' />
        </div>
        <h3 className='mt-4 text-base font-semibold text-gray-900 dark:text-gray-100'>No products found</h3>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto'>
          We couldn't find any products matching your search criteria. Try adjusting your query or filters.
        </p>
      </div>
    )
  }

  return (
    <div className='rounded-md border border-gray-200 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden'>
      <Table>
        <TableHeader className='bg-gray-50/80 dark:bg-zinc-800/50'>
          <TableRow>
            <TableHead className='w-[48px] px-4'>
              <Checkbox
                checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
                onCheckedChange={() => onToggleSelectAll?.()}
                aria-label='Select all products on current page'
              />
            </TableHead>
            <TableHead className='w-[80px]'>Image</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead className='w-[110px] text-right'>Price ($)</TableHead>
            <TableHead className='w-[160px]'>Created At</TableHead>
            <TableHead className='w-[160px]'>Updated At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isSelected = selectedIds.includes(product.id)
            const displayImage = product.thumbnailUrl || product.image

            return (
              <TableRow
                key={product.id}
                data-state={isSelected ? "selected" : undefined}
                className={cn(
                  "hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors",
                  isSelected && "bg-primary/5 dark:bg-primary/10"
                )}
              >
                <TableCell className='w-[48px] px-4'>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect?.(product.id)}
                    aria-label={`Select ${product.name}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className='h-12 w-12 rounded-md overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 flex items-center justify-center shrink-0'>
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={product.name}
                        className='h-full w-full object-cover'
                        onError={(e) => {
                          // Fallback image handling
                          ;(e.target as HTMLElement).style.display = "none"
                          const parent = (e.target as HTMLElement).parentElement
                          if (parent) {
                            const icon = document.createElement("div")
                            icon.className = "text-gray-400"
                            icon.innerHTML = `<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`
                            parent.appendChild(icon)
                          }
                        }}
                      />
                    ) : (
                      <ImageIcon className='size-5 text-gray-400' />
                    )}
                  </div>
                </TableCell>
                <TableCell className='max-w-[280px]'>
                  <button
                    type='button'
                    onClick={() => onEdit?.(product)}
                    className='font-medium text-gray-900 dark:text-gray-100 hover:text-primary hover:underline transition-colors text-left truncate block w-full cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs'
                    title={`Edit ${product.name}`}
                  >
                    {product.name}
                  </button>
                </TableCell>
                <TableCell className='text-xs font-semibold text-right text-gray-800 dark:text-gray-200 whitespace-nowrap'>
                  {typeof product.price === "number" ? `$${product.price.toFixed(2)}` : "—"}
                </TableCell>
                <TableCell className='text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap'>
                  {product.createdAt ? formatDateTime(product.createdAt) : "—"}
                </TableCell>
                <TableCell className='text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap'>
                  {product.updatedAt ? formatDateTime(product.updatedAt) : "—"}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
