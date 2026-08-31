import React, { useEffect, useRef, useState } from "react"
import {
  Search,
  ArrowUpDown,
  LayoutGrid,
  List,
  Plus,
  Sparkles,
  UploadCloud,
  Check,
  FileImage,
  Video,
  FileText,
  File as FileIcon,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "~/core/components/shadcn/dialog"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/core/components/shadcn/dropdown-menu"
import { getMediaPage, uploadMedia } from "~/shared/services/api/mediaService"
import type { MediaResponse } from "~/shared/types"
import { cn } from "~/shared/utils/appUtils"

interface MediaSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectMedia: (selectedMedias: { url: string; name: string }[]) => void
  initialSelectedUrls?: string[]
}

export default function MediaSelectModal({
  open,
  onOpenChange,
  onSelectMedia,
  initialSelectedUrls = []
}: MediaSelectModalProps) {
  const [mediaList, setMediaList] = useState<MediaResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "name" | "size">("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch media from service when modal opens
  useEffect(() => {
    if (open) {
      fetchMedia()
    }
  }, [open])

  const fetchMedia = async () => {
    setIsLoading(true)
    try {
      const res = await getMediaPage({ pageSize: 100 })
      setMediaList(res.content || [])

      // Pre-select items if matching initialSelectedUrls
      if (initialSelectedUrls.length > 0) {
        const matchingIds = new Set<string>()
        res.content.forEach((item: MediaResponse) => {
          if (initialSelectedUrls.includes(item.url)) {
            matchingIds.add(item.id)
          }
        })
        setSelectedIds(matchingIds)
      } else {
        setSelectedIds(new Set())
      }
    } catch (err) {
      console.error("Failed to load media list:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle local file upload
  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (!fileArray.length) return

    setIsLoading(true)
    try {
      const uploadPromises = fileArray.map((file) => uploadMedia(file))
      const newItems = await Promise.all(uploadPromises)
      
      setMediaList((prev) => [...newItems, ...prev])
      
      // Auto-select newly uploaded items
      setSelectedIds((prev) => {
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
    e.preventDefault()
    setIsDraggingOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Filtered & Sorted Media items
  const filteredMedia = mediaList
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      let matchesType = true
      if (fileTypeFilter === "image") matchesType = item.type.startsWith("image/")
      else if (fileTypeFilter === "video") matchesType = item.type.startsWith("video/")
      else if (fileTypeFilter === "document") matchesType = item.type.includes("pdf") || item.type.includes("text")

      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (sortOrder === "name") return a.name.localeCompare(b.name)
      if (sortOrder === "size") return b.size - a.size
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })


  const handleDone = () => {
    const selectedItems = mediaList
      .filter((item) => selectedIds.has(item.id))
      .map((item) => ({ url: item.url, name: item.name }))
    
    onSelectMedia(selectedItems)
    onOpenChange(false)
  }

  const getExtension = (name: string, type: string) => {
    if (type.startsWith("image/jpeg")) return "JPG"
    if (type.startsWith("image/png")) return "PNG"
    if (type.startsWith("image/webp")) return "WEBP"
    if (type.startsWith("video/")) return "MP4"
    if (type.includes("pdf")) return "PDF"
    const parts = name.split(".")
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-4xl w-[92vw] max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* 1. Modal Header */}
        <DialogHeader className="p-4 border-b border-gray-100 dark:border-zinc-800 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Select file
          </DialogTitle>
        </DialogHeader>

        {/* 2. Top Filter Controls Bar */}
        <div className="p-4 space-y-3 bg-gray-50/50 dark:bg-zinc-800/30 border-b border-gray-100 dark:border-zinc-800 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files"
                className="pl-9 bg-white dark:bg-zinc-900 h-9 border-gray-200 dark:border-zinc-700 text-sm focus-visible:ring-1"
              />
            </div>

            {/* Sort & Layout Toggles */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-medium border-gray-200">
                    <ArrowUpDown className="size-3.5 text-gray-500" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOrder("newest")} className="text-xs">
                    Newest first
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("name")} className="text-xs">
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("size")} className="text-xs">
                    File size
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-7 w-7 rounded-xs", viewMode === "grid" && "bg-gray-100 dark:bg-zinc-800 text-primary")}
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                >
                  <LayoutGrid className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-7 w-7 rounded-xs", viewMode === "list" && "bg-gray-100 dark:bg-zinc-800 text-primary")}
                  onClick={() => setViewMode("list")}
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
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-full border-dashed border-gray-300 bg-white">
                  File type {fileTypeFilter !== "all" && `(${fileTypeFilter})`} ▾
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFileTypeFilter("all")}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFileTypeFilter("image")}>Images</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFileTypeFilter("video")}>Videos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFileTypeFilter("document")}>Documents</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" className="h-7 text-xs rounded-full border-dashed border-gray-300 bg-white">
              File size ▾
            </Button>

            <Button variant="outline" size="sm" className="h-7 text-xs rounded-full border-dashed border-gray-300 bg-white">
              Used in ▾
            </Button>

            <Button variant="outline" size="sm" className="h-7 text-xs rounded-full border-dashed border-gray-300 bg-white">
              Product ▾
            </Button>

            {(searchQuery || fileTypeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-gray-500 hover:text-gray-900"
                onClick={() => {
                  setSearchQuery("")
                  setFileTypeFilter("all")
                }}
              >
                Reset filters
              </Button>
            )}
          </div>
        </div>

        {/* 3. Modal Main Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDraggingOver(true)
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-5 text-center transition-all bg-gray-50/50 dark:bg-zinc-800/20 flex flex-col items-center justify-center gap-3",
              isDraggingOver
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-gray-300 dark:border-zinc-700 hover:border-gray-400"
            )}
          >
            <div className="flex items-center justify-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 font-medium border-gray-300 bg-white shadow-xs">
                    Add media ▾
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                    <UploadCloud className="size-4 mr-2 text-blue-500" />
                    Upload from computer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const url = prompt("Enter Image URL:")
                    if (url) {
                      const tempItem: MediaResponse = {
                        id: `ext_${Date.now()}`,
                        name: "external-image.jpg",
                        url: url,
                        type: "IMAGE",
                        size: 0,
                        fileType: "jpg",
                        active: true
                      }
                      setMediaList((prev) => [tempItem, ...prev])
                      setSelectedIds((prev) => new Set(prev).add(tempItem.id))
                    }
                  }} className="cursor-pointer">
                    <Plus className="size-4 mr-2 text-emerald-500" />
                    Add from URL
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 font-medium border-gray-300 bg-white shadow-xs"
                onClick={() => alert("Generate image with AI feature")}
              >
                <Sparkles className="size-4 text-purple-500" />
                Generate image
              </Button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Drag and drop images, videos, 3D models, and files
            </p>
          </div>

          {/* Media Grid / List Display */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-gray-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <FileImage className="size-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No media found matching criteria</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredMedia.map((item) => {
                const isSelected = selectedIds.has(item.id)
                const ext = getExtension(item.name, item.type)

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={cn(
                      "group relative aspect-square rounded-lg border bg-white dark:bg-zinc-800 overflow-hidden cursor-pointer transition-all flex flex-col justify-between p-2 select-none shadow-2xs",
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                        : "border-gray-200 dark:border-zinc-700 hover:border-gray-400"
                    )}
                  >
                    {/* Checkbox Overlay Top-Left */}
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white/90 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-xs"
                      />
                    </div>

                    {/* Thumbnail Preview */}
                    <div className="w-full h-24 flex items-center justify-center overflow-hidden rounded-md bg-gray-50 dark:bg-zinc-900 mt-4">
                      {item.type.startsWith("image/") ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      ) : item.type.startsWith("video/") ? (
                        <Video className="size-8 text-purple-500" />
                      ) : (
                        <FileText className="size-8 text-gray-400" />
                      )}
                    </div>

                    {/* File Meta Info */}
                    <div className="mt-1 text-center">
                      <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                        {ext}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* List View */
            <div className="divide-y border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
              {filteredMedia.map((item) => {
                const isSelected = selectedIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(item.id)} />
                    <div className="w-10 h-10 rounded border overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                      {item.type.startsWith("image/") ? (
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <FileIcon className="size-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.type} • {(item.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 4. Modal Footer */}
        <DialogFooter className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-row items-center justify-between sm:justify-between shrink-0">
          <div className="text-xs text-gray-500 font-medium">
            {selectedIds.size > 0 ? (
              <span className="text-primary font-semibold">{selectedIds.size} file(s) selected</span>
            ) : (
              "No files selected"
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs font-medium border-gray-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={selectedIds.size === 0}
              onClick={handleDone}
              className="h-9 px-5 text-xs font-medium bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Done
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
