import React, { useEffect, useRef, useState, useCallback } from "react"
import { UploadCloud, FileImage } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "~/core/components/shadcn/dialog"
import { getMediaPage, uploadMedia } from "~/shared/services/api/mediaService"
import type { MediaResponse } from "~/shared/types"
import { isImageMedia, isVideoMedia } from "~/shared/utils"
import {
  MediaCardItem,
  MediaListItem,
  MediaFilterBar,
  MediaDropzone,
  MediaSelectFooter,
  type SortOrderOption,
  type ViewModeOption
} from "./mediaSelect"

export interface MediaSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectMedia: (selectedMedias: { id: string; url: string; name: string }[]) => void
  initialSelectedUrls?: string[]
  multiple?: boolean
  title?: string
}

export default function MediaSelectModal({
  open,
  onOpenChange,
  onSelectMedia,
  initialSelectedUrls = [],
  multiple = true,
  title = "Select file"
}: MediaSelectModalProps) {
  const [mediaList, setMediaList] = useState<MediaResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all")
  const [fileSizeFilter, setFileSizeFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<SortOrderOption>("newest")
  const [viewMode, setViewMode] = useState<ViewModeOption>("grid")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasInitializedRef = useRef(false)

  const fetchMedia = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getMediaPage({ pageSize: 100 })
      const items = res.content || []

      // Deduplicate fetched items by ID and URL to prevent duplicate rendering
      const seenIds = new Set<string>()
      const seenUrls = new Set<string>()
      const uniqueItems: MediaResponse[] = []
      items.forEach((item: MediaResponse) => {
        if (!seenIds.has(item.id) && !seenUrls.has(item.url)) {
          seenIds.add(item.id)
          seenUrls.add(item.url)
          uniqueItems.push(item)
        }
      })
      setMediaList(uniqueItems)
    } catch (err) {
      console.error("Failed to load media list:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch media from service when modal opens
  useEffect(() => {
    if (open) {
      hasInitializedRef.current = false
      fetchMedia()
    } else {
      setSelectedIds(new Set())
      hasInitializedRef.current = false
    }
  }, [open, fetchMedia])

  // Pre-select items once mediaList is loaded
  const initialUrlsKey = initialSelectedUrls.join(",")
  useEffect(() => {
    if (open && mediaList.length > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      if (initialSelectedUrls.length > 0) {
        const initialUrlsSet = new Set(initialSelectedUrls.filter(Boolean))
        const matchingIds = new Set<string>()
        mediaList.forEach((item: MediaResponse) => {
          if (initialUrlsSet.has(item.url)) {
            if (multiple) {
              matchingIds.add(item.id)
            } else if (matchingIds.size === 0) {
              matchingIds.add(item.id)
            }
          }
        })
        setSelectedIds(matchingIds)
      } else {
        setSelectedIds(new Set())
      }
    }
  }, [open, mediaList, initialUrlsKey, multiple, initialSelectedUrls])

  // Handle local file upload
  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (!fileArray.length) return

    setIsLoading(true)
    try {
      const uploadPromises = fileArray.map((file) => uploadMedia(file))
      const newItems = await Promise.all(uploadPromises)

      // Add newly uploaded items to state, deduplicated
      setMediaList((prev) => {
        const existingIds = new Set(prev.map((i) => i.id))
        const existingUrls = new Set(prev.map((i) => i.url))
        const uniqueNew = newItems.filter(
          (i) => !existingIds.has(i.id) && !existingUrls.has(i.url)
        )
        return [...uniqueNew, ...prev]
      })

      // Auto-select newly uploaded items
      setSelectedIds((prev) => {
        if (!multiple) {
          return newItems.length > 0 ? new Set([newItems[0].id]) : prev
        }
        const next = new Set(prev)
        newItems.forEach((item) => next.add(item.id))
        return next
      })
    } catch (err) {
      console.error("Error uploading files:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadFiles(e.target.files)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (!multiple) {
        if (prev.has(id)) {
          return new Set()
        }
        return new Set([id])
      }
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleItemDoubleClick = (item: MediaResponse) => {
    if (!multiple) {
      onSelectMedia([{ id: item.id, url: item.url, name: item.name }])
      onOpenChange(false)
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setFileTypeFilter("all")
    setFileSizeFilter("all")
  }

  // Filtered & Sorted Media items
  const filteredMedia = mediaList
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      let matchesType = true
      const isImg = isImageMedia(item)
      const isVid = isVideoMedia(item)
      const typeStr = (item.type || item.fileType || "").toLowerCase()

      if (fileTypeFilter === "image") matchesType = isImg
      else if (fileTypeFilter === "video") matchesType = isVid
      else if (fileTypeFilter === "document")
        matchesType = typeStr.includes("pdf") || typeStr.includes("text")

      let matchesSize = true
      if (fileSizeFilter === "small") matchesSize = item.size < 1024 * 1024
      else if (fileSizeFilter === "medium")
        matchesSize = item.size >= 1024 * 1024 && item.size <= 5 * 1024 * 1024
      else if (fileSizeFilter === "large") matchesSize = item.size > 5 * 1024 * 1024

      return matchesSearch && matchesType && matchesSize
    })
    .sort((a, b) => {
      if (sortOrder === "name") return a.name.localeCompare(b.name)
      if (sortOrder === "size") return b.size - a.size
      const timeStrA = a.createdAt
      const timeStrB = b.createdAt
      const dateA = timeStrA ? new Date(timeStrA).getTime() : 0
      const dateB = timeStrB ? new Date(timeStrB).getTime() : 0
      return dateB - dateA
    })

  const handleDone = () => {
    const selectedItems = mediaList
      .filter((item) => selectedIds.has(item.id))
      .map((item) => ({ id: item.id, url: item.url, name: item.name }))

    onSelectMedia(selectedItems)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-4xl w-[92vw] h-[82vh] max-h-[740px] flex flex-col p-0 overflow-hidden bg-white dark:bg-zinc-900 border-0 rounded-2xl shadow-2xl [&_[data-slot=dialog-close]]:top-4 [&_[data-slot=dialog-close]]:right-5 [&_[data-slot=dialog-close]]:size-7 [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:flex [&_[data-slot=dialog-close]]:items-center [&_[data-slot=dialog-close]]:justify-center [&_[data-slot=dialog-close]]:bg-gray-100/80 [&_[data-slot=dialog-close]]:hover:bg-gray-200 [&_[data-slot=dialog-close]]:text-gray-600 [&_[data-slot=dialog-close]]:opacity-100 [&_[data-slot=dialog-close]]:transition-colors">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*,video/*,.pdf"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* 1. Modal Header (Clean borderless header) */}
        <DialogHeader className="px-6 pt-5 pb-1 border-b-0 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* 2. Top Filter Controls Bar */}
        <MediaFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          fileTypeFilter={fileTypeFilter}
          onFileTypeChange={setFileTypeFilter}
          fileSizeFilter={fileSizeFilter}
          onFileSizeChange={setFileSizeFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={handleResetFilters}
        />

        {/* 3. Modal Main Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-2 space-y-3">
          {/* Drag & Drop Upload Zone (Compact banner) */}
          <MediaDropzone
            onDrop={handleDrop}
            onOpenFilePicker={() => fileInputRef.current?.click()}
          />

          {/* Media Items Presentation */}
          {isLoading && mediaList.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400">
              <UploadCloud className="size-8 mx-auto animate-bounce mb-2 text-primary opacity-60" />
              Loading media files...
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400 space-y-1">
              <FileImage className="size-8 mx-auto mb-2 opacity-40" />
              <p>No files found.</p>
              <p className="text-xs text-muted-foreground">
                Try searching with a different keyword or upload new files.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View (6 Columns on desktop - Matching Image 2) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
              {filteredMedia.map((item) => (
                <MediaCardItem
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id)}
                  onToggleSelect={toggleSelect}
                  onDoubleClick={handleItemDoubleClick}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="divide-y border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
              {filteredMedia.map((item) => (
                <MediaListItem
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id)}
                  onToggleSelect={toggleSelect}
                  onDoubleClick={handleItemDoubleClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* 4. Modal Footer (Shopify Style) */}
        <MediaSelectFooter
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          onCancel={() => onOpenChange(false)}
          onDone={handleDone}
        />
      </DialogContent>
    </Dialog>
  )
}
