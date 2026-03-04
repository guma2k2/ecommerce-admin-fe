import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
type SortableImageProps = {
  image: { id: string; url: string }
}
export default function SortableImage({ image }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 23 : 20
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='rounded-md overflow-hidden border cursor-grab active:cursor-grabbing relative z-21 aspect-square'
    >
      <img src={image.url} alt='Image' className='w-full h-full object-cover rounded-md' />
    </div>
  )
}
