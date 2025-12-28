import { useEditorState } from '@tiptap/react'
import { BoldIcon } from 'lucide-react'
import type { Ref } from 'react'
import { useToolbar } from '~/components/tiptap/toolbars/ToolbarProvider'
import { Button, type ButtonProps } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/utils/appUtils'
type BoldToolbarProps = ButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string
  }
export default function BoldToolbar({ className, onClick, children, ...props }: BoldToolbarProps) {
  const { editor } = useToolbar()
  const isActive = useEditorState({
    editor,
    selector: () => editor?.isActive('bold')
  })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          type='button'
          className={cn('h-8 w-8 p-0 sm:h-9 sm:w-9', isActive && 'bg-accent', className)}
          onClick={(e) => {
            editor?.chain().focus().toggleBold().run()
            onClick?.(e)
          }}
          disabled={!editor?.can().chain().focus().toggleBold().run()}
          {...props}
        >
          {children ?? <BoldIcon className='h-4 w-4' />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>Bold</span>
        <span className='ml-1 text-xs text-gray-11'>(cmd + b)</span>
      </TooltipContent>
    </Tooltip>
  )
}
