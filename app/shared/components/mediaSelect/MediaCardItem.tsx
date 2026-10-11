import React, { useState } from "react"
import { Video, FileText } from "lucide-react"
import { Checkbox } from "~/core/components/shadcn/checkbox"
import type { MediaResponse } from "~/shared/types"
import {
  cn,
  getFileExtension,
  isImageMedia,
  isVideoMedia,
  formatDuration
} from "~/shared/utils"

export interface MediaCardItemProps {
  item: MediaResponse
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onDoubleClick?: (item: MediaResponse) => void
}

export default function MediaCardItem({
  item,
  isSelected,
  onToggleSelect,
  onDoubleClick
}: MediaCardItemProps) {
  const isImage = isImageMedia(item)
  const isVideo = isVideoMedia(item)
  const ext =
    getFileExtension(item.name, item.fileType || item.type) ||
    (isVideo ? "MP4" : isImage ? "PNG" : "FILE")

  const [duration, setDuration] = useState<string>(() => formatDuration(item.duration))
  const [videoLoadError, setVideoLoadError] = useState(false)

  return (
    <div
      onClick={() => onToggleSelect(item.id)}
      onDoubleClick={() => onDoubleClick?.(item)}
      className={cn(
        "group relative rounded-xl p-2 transition-all cursor-pointer select-none flex flex-col justify-between border",
        isSelected
          ? "bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 shadow-2xs"
          : "bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800 hover:border-gray-300 hover:shadow-2xs"
      )}
    >
      {/* Thumbnail Preview Box */}
      <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden rounded-lg bg-gray-50 dark:bg-zinc-900">
        {/* Top Select Checkbox */}
        <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(item.id)}
            className="size-4 bg-white/90 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-xs"
          />
        </div>

        {/* Duration Badge for Videos (Top Right) */}
        {isVideo && duration && (
          <span className="absolute top-2 right-2 bg-black/80 text-white text-2xs font-mono px-1.5 py-0.5 rounded backdrop-blur-xs z-10 pointer-events-none shadow-xs">
            {duration}
          </span>
        )}

        {isImage ? (
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
        ) : isVideo ? (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            {!videoLoadError ? (
              <video
                src={`${item.url}#t=0.001`}
                preload="metadata"
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
                onLoadedMetadata={(e) => {
                  if (!duration && e.currentTarget.duration) {
                    setDuration(formatDuration(e.currentTarget.duration))
                  }
                }}
                onError={() => setVideoLoadError(true)}
              />
            ) : (
              <Video className="size-7 text-purple-400" />
            )}
          </div>
        ) : (
          <FileText className="size-7 text-gray-400" />
        )}
      </div>

      {/* File Meta Info */}
      <div className="mt-1.5 text-center">
        <p
          className="text-xs font-normal text-gray-900 dark:text-gray-100 truncate leading-tight"
          title={item.name}
        >
          {item.name}
        </p>
        <p className="text-2xs font-normal uppercase text-muted-foreground mt-0.5">
          {ext}
        </p>
      </div>
    </div>
  )
}
