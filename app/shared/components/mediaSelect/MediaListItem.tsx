import React from "react"
import { File as FileIcon } from "lucide-react"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import type { MediaResponse } from "~/shared/types"
import { cn, isImageMedia, isVideoMedia } from "~/shared/utils"

export interface MediaListItemProps {
  item: MediaResponse
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onDoubleClick?: (item: MediaResponse) => void
}

export default function MediaListItem({
  item,
  isSelected,
  onToggleSelect,
  onDoubleClick
}: MediaListItemProps) {
  const isImg = isImageMedia(item)
  const isVid = isVideoMedia(item)

  return (
    <div
      onClick={() => onToggleSelect(item.id)}
      onDoubleClick={() => onDoubleClick?.(item)}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800",
        isSelected && "bg-primary/5"
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(item.id)}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="w-10 h-10 rounded border overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
        {isImg ? (
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : isVid ? (
          <video
            src={`${item.url}#t=0.001`}
            preload="metadata"
            muted
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <FileIcon className="size-5 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
          {item.name}
        </p>
      </div>
    </div>
  )
}
