import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"
import { Input } from "~/core/components/shadcn/input"
import { cn } from "~/shared/utils/appUtils"

export interface SortableOptionValueItemProps {
  id: string
  value: string
  index: number
  optionIndex: number
  onChange: (value: string) => void
  onRemove: () => void
}

function SortableOptionValueItemComponent({
  id,
  value,
  onChange,
  onRemove
}: SortableOptionValueItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 50 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 w-full group relative",
        isDragging && "opacity-30"
      )}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing p-1 rounded focus:outline-none transition-colors shrink-0 touch-none select-none"
        title="Drag to reorder value"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Value Input with integrated Delete/Trash button */}
      <div className="relative flex-1 flex items-center">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Value (e.g. S, M, Red)"
          className="h-9 w-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 rounded-lg text-sm pr-9 text-gray-900 dark:text-gray-100 shadow-2xs focus-visible:ring-1"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2.5 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors focus:outline-none"
          title="Delete value"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}

export default React.memo(SortableOptionValueItemComponent)
