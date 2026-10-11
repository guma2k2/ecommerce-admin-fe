import React from "react"
import { DialogFooter } from "~/core/components/shadcn/dialog"
import { Button } from "~/core/components/shadcn/button"

export interface MediaSelectFooterProps {
  selectedCount: number
  onClearSelection: () => void
  onCancel: () => void
  onDone: () => void
}

export default function MediaSelectFooter({
  selectedCount,
  onClearSelection,
  onCancel,
  onDone
}: MediaSelectFooterProps) {
  return (
    <DialogFooter className="px-6 py-3 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-row items-center justify-between sm:justify-between shrink-0">
      <div className="flex items-center gap-3">
        {selectedCount > 0 && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium cursor-pointer"
            onClick={onClearSelection}
          >
            Clear selection
          </Button>
        )}
        <span className="text-xs text-gray-500 font-normal">
          {selectedCount > 0 ? `${selectedCount} file(s) selected` : "No files selected"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="h-8 px-3.5 text-xs font-medium rounded-lg border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={selectedCount === 0}
          onClick={onDone}
          className="h-8 px-4 text-xs font-medium rounded-lg bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-40"
        >
          Done
        </Button>
      </div>
    </DialogFooter>
  )
}
