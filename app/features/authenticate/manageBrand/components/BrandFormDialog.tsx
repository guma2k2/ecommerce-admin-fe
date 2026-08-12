import * as React from "react"
import { Award, Pencil, Loader2, Image as ImageIcon } from "lucide-react"
import type { BrandItem } from "~/shared/services/api/brandService"
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

interface BrandFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brandToEdit: BrandItem | null
  onSubmit: (data: { name: string; image: string }) => Promise<void>
}

export default function BrandFormDialog({
  open,
  onOpenChange,
  brandToEdit,
  onSubmit,
}: BrandFormDialogProps) {
  const [name, setName] = React.useState("")
  const [image, setImage] = React.useState("")
  const [error, setError] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [imagePreviewFailed, setImagePreviewFailed] = React.useState(false)

  const isEditing = Boolean(brandToEdit)

  React.useEffect(() => {
    if (open) {
      if (brandToEdit) {
        setName(brandToEdit.name)
        setImage(brandToEdit.image || "")
      } else {
        setName("")
        setImage("")
      }
      setError("")
      setImagePreviewFailed(false)
    }
  }, [open, brandToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      setError("Brand name is required")
      return
    }

    if (trimmedName.length < 2) {
      setError("Brand name must be at least 2 characters long")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      await onSubmit({ name: trimmedName, image: image.trim() })
      onOpenChange(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to save brand")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              {isEditing ? <Pencil className="size-5" /> : <Award className="size-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isEditing ? "Edit Brand" : "Add New Brand"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Update brand information for ${brandToEdit?.name}`
                  : "Fill in the brand details below to add a new brand."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Note: ID is hidden as requested */}

          {/* Brand Name Input */}
          <div className="space-y-1.5">
            <Label htmlFor="brand-name" className="text-sm font-medium">
              Brand Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="brand-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError("")
              }}
              placeholder="e.g. Apple Inc., Samsung, Logitech"
              autoFocus
              className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          </div>

          {/* Brand Image Input & Live Preview */}
          <div className="space-y-2">
            <Label htmlFor="brand-image" className="text-sm font-medium">
              Brand Logo / Image URL
            </Label>
            <div className="flex gap-3 items-center">
              {/* Image Preview Box */}
              <div className="w-14 h-14 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 shrink-0 flex items-center justify-center overflow-hidden p-1">
                {image && !imagePreviewFailed ? (
                  <img
                    src={image}
                    alt="Brand logo preview"
                    onError={() => setImagePreviewFailed(true)}
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <ImageIcon className="size-6 text-gray-400" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <Input
                  id="brand-image"
                  type="url"
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value)
                    setImagePreviewFailed(false)
                  }}
                  placeholder="https://example.com/logo.png"
                  className="text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Paste an image URL for the brand logo.
                </p>
              </div>
            </div>
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
              {isEditing ? "Save Changes" : "Create Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
