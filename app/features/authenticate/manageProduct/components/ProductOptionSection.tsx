import React, { useState } from "react"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { GripVertical, Plus } from "lucide-react"
import { Badge } from "~/core/components/shadcn/badge"
import { Button } from "~/core/components/shadcn/button"
import type { OptionAxisItem } from "./SortableOptionAxisCard"
import SortableOptionAxisCard from "./SortableOptionAxisCard"

export interface ProductOptionSectionProps {
  optionFields: { id: string }[]
  options: OptionAxisItem[]
  onAddOption: () => void
  onRemoveOption: (optionIndex: number) => void
  onUpdateOptionName: (optionIndex: number, name: string, productOptionId?: number) => void
  onAddValue: (optionIndex: number, valueText: string) => void
  onUpdateValue: (optionIndex: number, valueIndex: number, newValue: string) => void
  onRemoveValue: (optionIndex: number, valueIndex: number) => void
  onReorderValues: (optionIndex: number, oldIndex: number, newIndex: number) => void
  onToggleShowing: (optionIndex: number, showing: boolean) => void
  onDoneOption?: (optionIndex: number, pendingValue?: string) => void
  onDragEndOption: (event: DragEndEvent) => void
}

export default function ProductOptionSection({
  optionFields,
  options,
  onAddOption,
  onRemoveOption,
  onUpdateOptionName,
  onAddValue,
  onUpdateValue,
  onRemoveValue,
  onReorderValues,
  onToggleShowing,
  onDoneOption,
  onDragEndOption
}: ProductOptionSectionProps) {
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Variation Axes (Options)
        </h4>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs divide-y divide-gray-200 dark:divide-zinc-800 overflow-hidden">
        {optionFields.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveOptionId(e.active.id as string)}
            onDragEnd={(e) => {
              setActiveOptionId(null)
              onDragEndOption(e)
            }}
            onDragCancel={() => setActiveOptionId(null)}
          >
            <SortableContext
              items={optionFields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                {optionFields.map((field, optIdx) => {
                  const otherOptionNames = options
                    .filter((_, i) => i !== optIdx)
                    .map((o) => o.name?.trim())
                    .filter(Boolean) as string[]

                  return (
                    <SortableOptionAxisCard
                      key={field.id}
                      fieldId={field.id}
                      optIdx={optIdx}
                      option={options[optIdx] || field}
                      disabledOptionNames={otherOptionNames}
                      onUpdateName={(name, productOptionId) =>
                        onUpdateOptionName(optIdx, name, productOptionId)
                      }
                      onAddValue={(val) => onAddValue(optIdx, val)}
                      onUpdateValue={(valIdx, val) => onUpdateValue(optIdx, valIdx, val)}
                      onRemoveValue={(valIdx) => onRemoveValue(optIdx, valIdx)}
                      onReorderValues={(oldIdx, newIdx) => onReorderValues(optIdx, oldIdx, newIdx)}
                      onRemoveOption={() => onRemoveOption(optIdx)}
                      onToggleShowing={(showing) => onToggleShowing(optIdx, showing)}
                      onDone={(pendingVal) => onDoneOption?.(optIdx, pendingVal)}
                    />
                  )
                })}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
              {activeOptionId ? (
                (() => {
                  const activeIdx = optionFields.findIndex((f) => f.id === activeOptionId)
                  const activeOpt = activeIdx !== -1 ? options[activeIdx] : null
                  return activeOpt ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-primary shadow-2xl p-4 flex items-center justify-between gap-3 opacity-95">
                      <div className="flex items-center gap-3">
                        <GripVertical className="size-4 text-primary shrink-0" />
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {activeOpt.name || "Untitled Option"}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {activeOpt.values
                              ?.filter((v) => v.value?.trim())
                              .map((val, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {val.value}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null
                })()
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Bottom "+ Add another option" Action Row */}
        <Button
          type="button"
          variant="ghost"
          onClick={onAddOption}
          className="w-full justify-start h-auto p-3.5 px-5 text-xs font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 rounded-none rounded-b-xl border-t border-gray-100 dark:border-zinc-800 select-none"
        >
          <Plus className="size-4 text-gray-500 shrink-0" />
          <span>Add another option</span>
        </Button>
      </div>
    </div>
  )
}
