import React, { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "~/core/components/shadcn/button"
import { cn } from "~/shared/utils"

export interface MediaDropzoneProps {
  onDrop: (e: React.DragEvent) => void
  onOpenFilePicker: () => void
}

export default function MediaDropzone({
  onDrop,
  onOpenFilePicker
}: MediaDropzoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = () => {
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    onDrop(e)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group border border-dashed rounded-xl py-2.5 px-4 text-center transition-all flex flex-col items-center justify-center gap-1",
        isDraggingOver
          ? "border-primary bg-primary/5 dark:bg-primary/10 scale-[0.99]"
          : "border-gray-300 dark:border-zinc-700 bg-transparent hover:bg-gray-50/50 dark:hover:bg-zinc-800/30"
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenFilePicker}
          className="h-7 px-3 gap-1.5 text-xs font-medium rounded-full border-gray-200 dark:border-zinc-700 bg-gray-100/70 dark:bg-zinc-800/70 hover:bg-gray-100 dark:hover:bg-zinc-800 shadow-none text-gray-800 dark:text-gray-200"
        >
          <Plus className="size-3" />
          Add media ▾
        </Button>
      </div>
      <p className="text-xs text-muted-foreground font-normal">
        Drag and drop images, videos, 3D models, and files
      </p>
    </div>
  )
}
