import * as React from "react"
import { FolderPlus, Pencil, Loader2 } from "lucide-react"
import type { CategoryItem } from "../services/categoryService"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/core/components/shadcn/dialog"
import { Button } from "~/core/components/shadcn/button"
import { Input } from "~/core/components/shadcn/input"
import { Label } from "~/core/components/shadcn/label"

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryToEdit: CategoryItem | null
  onSubmit: (name: string) => Promise<void>
}

export default function CategoryFormDialog({
  open,
  onOpenChange,
  categoryToEdit,
  onSubmit,
}: CategoryFormDialogProps) {
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isEditing = Boolean(categoryToEdit)

  React.useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        setName(categoryToEdit.name)
      } else {
        setName("")
      }
      setError("")
    }
  }, [open, categoryToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      setError("Category name is required")
      return
    }

    if (trimmedName.length < 2) {
      setError("Category name must be at least 2 characters long")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      await onSubmit(trimmedName)
      onOpenChange(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to save category")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              {isEditing ? <Pencil className="size-5" /> : <FolderPlus className="size-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isEditing ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Update category details for ${categoryToEdit?.id}`
                  : "Fill in the category name below to create a new category."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {isEditing && categoryToEdit && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Category ID</Label>
              <Input
                value={categoryToEdit.id}
                disabled
                className="bg-gray-100 dark:bg-zinc-800 font-mono text-sm cursor-not-allowed opacity-80"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="category-name" className="text-sm font-medium">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError("")
              }}
              placeholder="e.g. Smart Home Electronics"
              autoFocus
              className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
