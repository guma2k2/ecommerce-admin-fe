import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"
import { Input } from "~/core/components/shadcn/input"
import { Button } from "~/core/components/shadcn/button"
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
  const [localVal, setLocalVal] = React.useState(value)

  React.useEffect(() => {
    setLocalVal(value)
  }, [value])

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
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing hover:bg-transparent shrink-0 touch-none select-none"
        title="Drag to reorder value"
      >
        <GripVertical className="size-4" />
      </Button>

      {/* Value Input with integrated Delete/Trash button */}
      <div className="relative flex-1 flex items-center">
        <Input
          type="text"
          value={localVal}
          onChange={(e) => {
            const next = e.target.value
            setLocalVal(next)
            onChange(next)
          }}
          placeholder="Value (e.g. S, M, Red)"
          className="h-9 w-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 rounded-lg text-sm pr-9 text-gray-900 dark:text-gray-100 shadow-2xs focus-visible:ring-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          className="absolute right-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-transparent"
          title="Delete value"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export default React.memo(SortableOptionValueItemComponent)
