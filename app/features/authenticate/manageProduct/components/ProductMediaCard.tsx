import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable"
import { ImagePlus, Trash2, FolderOpen, Star } from "lucide-react"
import { Button } from "~/core/components/shadcn/button"
import { MediaSelectModal } from "~/shared/components"
import SortableImage from "./SortableImage"
import type { ProductFormSchema } from "~/features/authenticate/manageProduct/validator"
import type { UploadType } from "~/shared/types"
import { isVideoUrl } from "~/shared/utils/appUtils"

export default function ProductMediaCard() {
  const { control, setValue, getValues } = useFormContext<ProductFormSchema>()
  const medias = useWatch({ control, name: "medias" }) || []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Convert form medias to UploadType for SortableImage component
  const uploadItems: UploadType[] = medias.map((m, index) => ({
    id: m.mediaId || `media-${index}`,
    url: m.url || "",
    file: null,
    status: "success",
    progress: 100,
    checked: !!m.isChecked
  }))

  // Add the "Upload / Add media" button slot at the end
  const allDisplayItems: UploadType[] = [
    ...uploadItems,
    {
      id: "btn-add-media-slot",
      url: "",
      file: null,
      status: "idle",
      progress: 0,
      checked: false
    }
  ]

  const checkedCount = medias.filter((m) => m.isChecked).length

  const initialSelectedUrls = medias.map((m) => m.url || "").filter(Boolean)

  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragId(e.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)
    if (!over || active.id === over.id) return

    const currentMedias = [...(getValues("medias") || [])]
    const oldIndex = currentMedias.findIndex(
      (m, idx) => (m.mediaId || `media-${idx}`) === active.id
    )
    const newIndex = currentMedias.findIndex(
      (m, idx) => (m.mediaId || `media-${idx}`) === over.id
    )

    if (oldIndex !== -1 && newIndex !== -1) {
      const item = currentMedias.splice(oldIndex, 1)[0]
      currentMedias.splice(newIndex, 0, item)

      // Re-assign position numbers (0, 1, 2...)
      const updated = currentMedias.map((m, pos) => ({
        ...m,
        position: pos
      }))
      setValue("medias", updated, { shouldDirty: true })
    }
  }

  const handleSelectFromModal = (selectedFiles: { id: string; url: string; name: string }[]) => {
    const current = getValues("medias") || []
    const selectedUrls = new Set(selectedFiles.map((f) => f.url).filter(Boolean))
    const selectedIds = new Set(selectedFiles.map((f) => f.id).filter(Boolean))

    // 1. Retain existing items that are still selected in the modal
    const retained = current.filter((m) =>
      (m.url && selectedUrls.has(m.url)) || (m.mediaId && selectedIds.has(m.mediaId))
    )

    const existingUrls = new Set(retained.map((m) => m.url).filter(Boolean))
    const existingIds = new Set(retained.map((m) => m.mediaId).filter(Boolean))

    // 2. Append newly selected items without duplicating
    const newItems: { mediaId: string; position: number; url: string; isChecked: boolean }[] = []
    selectedFiles.forEach((file) => {
      if (!existingUrls.has(file.url) && !existingIds.has(file.id)) {
        existingUrls.add(file.url)
        existingIds.add(file.id)
        newItems.push({
          mediaId: file.id,
          position: retained.length + newItems.length,
          url: file.url,
          isChecked: false
        })
      }
    })

    const updatedMedias = [...retained, ...newItems].map((item, index) => ({
      ...item,
      position: index
    }))

    setValue("medias", updatedMedias, { shouldDirty: true })
  }

  const handleToggleCheck = (index: number, checked: boolean) => {
    const current = [...(getValues("medias") || [])]
    if (current[index]) {
      current[index].isChecked = checked
      setValue("medias", current, { shouldDirty: true })
    }
  }

  const handleDeleteSelected = () => {
    const current = getValues("medias") || []
    const remaining = current.filter((m) => !m.isChecked)
    const updated = remaining.map((m, pos) => ({ ...m, position: pos }))
    setValue("medias", updated, { shouldDirty: true })
  }

  const activeDragItem = uploadItems.find((item) => item.id === activeDragId)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ImagePlus className="size-4 text-primary" />
            Media Gallery
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {checkedCount > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="h-8 gap-1.5 text-xs shadow-xs"
            >
              <Trash2 className="size-3.5" />
              Delete ({checkedCount})
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 gap-1.5 text-xs font-medium border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          >
            <FolderOpen className="size-3.5 text-primary" />
            Add Media
          </Button>
        </div>
      </div>

      {/* Media Grid with DndContext */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={allDisplayItems.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {allDisplayItems.map((item, index) => {
              const isCover = index === 0 && item.id !== "btn-add-media-slot"
              return (
                <SortableImage
                  key={item.id}
                  image={item}
                  isCover={isCover}
                  isDraggingAny={!!activeDragId}
                  onClickUpload={() => setIsModalOpen(true)}
                  onCheckedChange={(checked) => handleToggleCheck(index, checked)}
                />
              )
            })}
          </div>
        </SortableContext>

        <DragOverlay adjustScale dropAnimation={null}>
          {activeDragItem ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-primary shadow-xl bg-white">
              {isVideoUrl(activeDragItem.url) ? (
                <video
                  src={`${activeDragItem.url}#t=0.001`}
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activeDragItem.url}
                  alt="Drag preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Media Selection Dialog */}
      <MediaSelectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSelectMedia={handleSelectFromModal}
        initialSelectedUrls={initialSelectedUrls}
      />
    </div>
  )
}
