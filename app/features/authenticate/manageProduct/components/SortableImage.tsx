import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Checkbox } from "~/components/ui/checkbox"
import { Plus } from "lucide-react"
import { cn } from "~/utils/appUtils"

type UploadStatus = "idle" | "uploading" | "success" | "error"

export type UploadType = {
  file: File | null
  progress: number
  status: UploadStatus
  url: string
  checked: boolean
  id: string
}

type SortableImageProps = {
  image: UploadType
  isCover?: boolean
  onClickUpload?: () => void
  onCheckedChange?: (checked: boolean) => void
  isDraggingAny?: boolean
}

export default function SortableImage({
  image,
  isCover = false,
  onClickUpload,
  onCheckedChange,
  isDraggingAny = false
}: SortableImageProps) {
  const isUploadButton = !image.url && image.file === null

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
    disabled: isUploadButton
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1
  }

  // 1. Upload Dropzone / Add Media Slot (Shopify style)
  if (isUploadButton) {
    return (
      <div
        className={cn(
          "group relative w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 select-none"
        )}
        onClick={onClickUpload}
      >
        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5 text-gray-600" />
        </div>
        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Add media</span>
      </div>
    )
  }

  // 2. Uploading state
  if (image.status === "uploading") {
    return (
      <div className="relative w-full aspect-square rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-3 text-center select-none">
        <span className="text-xs text-gray-500 font-medium mb-2">Uploading...</span>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${image.progress}%` }} />
        </div>
      </div>
    )
  }

  // 3. Error state
  if (image.status === "error") {
    return (
      <div className="relative w-full aspect-square rounded-lg border border-red-300 bg-red-50 flex flex-col items-center justify-center p-2 text-center select-none">
        <span className="text-xs text-red-500 font-medium">Upload Error</span>
      </div>
    )
  }

  // 4. Uploaded Image Card (Shopify Polaris style)
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative w-full aspect-square rounded-lg overflow-hidden border bg-white cursor-grab active:cursor-grabbing select-none transition-shadow",
        isCover ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 hover:border-gray-300 shadow-sm",
        isDragging && "opacity-20 border-2 border-dashed border-blue-500 ring-0 z-50"
      )}
    >
      <img src={image.url} alt="Media preview" className="w-full h-full object-cover rounded-lg pointer-events-none" />

      {/* Cover Media Badge */}
      {isCover && (
        <span className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm z-10 pointer-events-none shadow-sm">
          Cover
        </span>
      )}

      {/* Hover & Checked Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/30 transition-opacity duration-150 z-20",
          "opacity-0",
          "pointer-events-none",
          !isDraggingAny && "group-hover:opacity-100",
          image.checked && "opacity-100"
        )}
      >
        <div className="absolute top-2 right-2 pointer-events-auto">
          <Checkbox
            className="h-4 w-4 accent-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white border-white bg-white/80"
            checked={image.checked}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={(value) => onCheckedChange?.(!!value)}
          />
        </div>
      </div>
    </div>
  )
}
