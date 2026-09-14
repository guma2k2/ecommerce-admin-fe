import { useState, useCallback } from "react"

export interface UseTableSelectionReturn<T extends string | number> {
  selectedIds: T[]
  setSelectedIds: React.Dispatch<React.SetStateAction<T[]>>
  isSelected: (id: T) => boolean
  toggleSelect: (id: T) => void
  toggleSelectAll: (currentIds: T[]) => void
  isAllSelected: (currentIds: T[]) => boolean
  isIndeterminate: (currentIds: T[]) => boolean
  clearSelection: () => void
  selectedCount: number
}

export function useTableSelection<T extends string | number = string | number>(
  initialSelected: T[] = []
): UseTableSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<T[]>(initialSelected)

  const isSelected = useCallback((id: T) => selectedIds.includes(id), [selectedIds])

  const toggleSelect = useCallback((id: T) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }, [])

  const toggleSelectAll = useCallback((currentIds: T[]) => {
    setSelectedIds((prev) => {
      const allCurrentSelected = currentIds.length > 0 && currentIds.every((id) => prev.includes(id))
      if (allCurrentSelected) {
        return prev.filter((id) => !currentIds.includes(id))
      }
      const newSelected = new Set([...prev, ...currentIds])
      return Array.from(newSelected)
    })
  }, [])

  const isAllSelected = useCallback(
    (currentIds: T[]) => currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id)),
    [selectedIds]
  )

  const isIndeterminate = useCallback(
    (currentIds: T[]) => {
      const someSelected = currentIds.some((id) => selectedIds.includes(id))
      const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id))
      return someSelected && !allSelected
    },
    [selectedIds]
  )

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  return {
    selectedIds,
    setSelectedIds,
    isSelected,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    isIndeterminate,
    clearSelection,
    selectedCount: selectedIds.length
  }
}

export default useTableSelection
