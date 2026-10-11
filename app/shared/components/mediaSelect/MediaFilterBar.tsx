import React from "react"
import { Search, ArrowUpDown, LayoutGrid, List } from "lucide-react"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/core/components/shadcn/dropdown-menu"
import { cn } from "~/shared/utils"

export type SortOrderOption = "newest" | "name" | "size"
export type ViewModeOption = "grid" | "list"

export interface MediaFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  fileTypeFilter: string
  onFileTypeChange: (value: string) => void
  fileSizeFilter: string
  onFileSizeChange: (value: string) => void
  sortOrder: SortOrderOption
  onSortOrderChange: (value: SortOrderOption) => void
  viewMode: ViewModeOption
  onViewModeChange: (value: ViewModeOption) => void
  onResetFilters: () => void
}

export default function MediaFilterBar({
  searchQuery,
  onSearchChange,
  fileTypeFilter,
  onFileTypeChange,
  fileSizeFilter,
  onFileSizeChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  onResetFilters
}: MediaFilterBarProps) {
  const isFiltered = Boolean(searchQuery || fileTypeFilter !== "all" || fileSizeFilter !== "all")

  return (
    <div className="px-6 pt-1 pb-3 space-y-2.5 bg-white dark:bg-zinc-900 shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search files"
            className="pl-8 bg-white dark:bg-zinc-900 h-8 border-gray-200 dark:border-zinc-700 text-xs rounded-lg focus-visible:ring-1"
          />
        </div>

        {/* Sort & Layout Toggles */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs font-medium border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50/60 dark:bg-zinc-800/60 hover:bg-gray-100"
              >
                <ArrowUpDown className="size-3.5 text-gray-500" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortOrderChange("newest")} className="text-xs">
                Newest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortOrderChange("name")} className="text-xs">
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortOrderChange("size")} className="text-xs">
                File size
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-md",
                viewMode === "grid" && "bg-gray-100 dark:bg-zinc-800 text-primary"
              )}
              onClick={() => onViewModeChange("grid")}
              title="Grid view"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-md",
                viewMode === "list" && "bg-gray-100 dark:bg-zinc-800 text-primary"
              )}
              onClick={() => onViewModeChange("list")}
              title="List view"
            >
              <List className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6.5 text-xs font-medium rounded-full border-gray-200 dark:border-zinc-700 bg-white hover:bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-2.5"
            >
              File type {fileTypeFilter !== "all" && `(${fileTypeFilter})`} ▾
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onFileTypeChange("all")}>All Types</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFileTypeChange("image")}>Images</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFileTypeChange("video")}>Videos</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFileTypeChange("document")}>
              Documents
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6.5 text-xs font-medium rounded-full border-gray-200 dark:border-zinc-700 bg-white hover:bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-2.5"
            >
              File size {fileSizeFilter !== "all" && `(${fileSizeFilter})`} ▾
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onFileSizeChange("all")}>All Sizes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFileSizeChange("small")}>
              &lt; 1 MB
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFileSizeChange("medium")}>
              1 MB - 5 MB
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFileSizeChange("large")}>
              &gt; 5 MB
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6.5 text-xs text-muted-foreground hover:text-foreground px-2"
            onClick={onResetFilters}
          >
            Reset filters
          </Button>
        )}
      </div>
    </div>
  )
}
