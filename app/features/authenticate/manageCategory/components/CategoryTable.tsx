import * as React from "react"
import { Folder, Pencil, Trash2, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import type { CategoryItem } from "~/shared/services/api/categoryService"
import type { SortDirection } from "~/shared/types/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/core/components/shadcn/table"
import { Button } from "~/core/components/shadcn/button"
import { Skeleton } from "~/core/components/shadcn/skeleton"

export type SortField = "id" | "name" | "created_at" | "updated_at"

interface CategoryTableProps {
  categories: CategoryItem[]
  isLoading?: boolean
  sortField: SortField
  sortOrder: SortDirection
  onSort: (field: SortField) => void
  onEdit: (category: CategoryItem) => void
  onDelete: (category: CategoryItem) => void
}

function formatDate(isoString: string): { dateStr: string; timeStr: string } {
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return { dateStr: isoString, timeStr: "" }
    const dateStr = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    })
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
    return { dateStr, timeStr }
  } catch {
    return { dateStr: isoString, timeStr: "" }
  }
}

export default function CategoryTable({
  categories,
  isLoading = false,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="size-3.5 ml-1 text-muted-foreground/60" />
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="size-3.5 ml-1 text-primary" />
    ) : (
      <ArrowDown className="size-3.5 ml-1 text-primary" />
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/80 dark:bg-zinc-800/50">
          <TableRow className="hover:bg-transparent">
            {/* Note: ID is hidden as requested */}
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("name")}
                className="-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
              >
                Category Name
                {renderSortIcon("name")}
              </Button>
            </TableHead>

            <TableHead className="w-[200px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("created_at")}
                className="-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
              >
                Created At
                {renderSortIcon("created_at")}
              </Button>
            </TableHead>

            <TableHead className="w-[200px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort("updated_at")}
                className="-ml-2 h-8 font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
              >
                Updated At
                {renderSortIcon("updated_at")}
              </Button>
            </TableHead>

            <TableHead className="w-[110px] text-right font-semibold text-gray-700 dark:text-gray-200 pr-4">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={`skeleton-${idx}`}>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell className="py-4 text-right pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <Skeleton className="size-8 rounded-md" />
                    <Skeleton className="size-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Folder className="size-6 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">No categories found</p>
                  <p className="text-xs text-gray-500">
                    Try adjusting your search criteria or add a new category.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => {
              const created = formatDate(category.created_at)
              const updated = formatDate(category.updated_at)

              return (
                <TableRow
                  key={category.id}
                  className="group transition-colors hover:bg-gray-50/60 dark:hover:bg-zinc-800/40"
                >
                  {/* Category Name (ID hidden) */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Folder className="size-4" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Created At */}
                  <TableCell className="py-3.5 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{created.dateStr}</span>
                      <span className="text-gray-400 dark:text-gray-500 font-mono">{created.timeStr}</span>
                    </div>
                  </TableCell>

                  {/* Updated At */}
                  <TableCell className="py-3.5 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{updated.dateStr}</span>
                      <span className="text-gray-400 dark:text-gray-500 font-mono">{updated.timeStr}</span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3.5 text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(category)}
                        className="h-8 w-8 text-gray-600 hover:text-primary hover:bg-primary/10 dark:text-gray-400 dark:hover:text-primary rounded-md"
                        title="Edit category"
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit category</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(category)}
                        className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 rounded-md"
                        title="Delete category"
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete category</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
