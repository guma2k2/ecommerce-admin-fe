import { useEditorState } from '@tiptap/react'
import { ItalicIcon } from 'lucide-react'
import React from 'react'
import { useToolbar } from '~/components/tiptap/toolbars/ToolbarProvider'
import { Button, type ButtonProps } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/utils/appUtils'
type ItalicToolbar = ButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string
  }
export default function ItalicToolbar({ className, onClick, children, ...props }: ItalicToolbar) {
  const { editor } = useToolbar()
  const isActive = useEditorState({
    editor,
    selector: () => editor?.isActive('italic')
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
            editor?.chain().focus().toggleItalic().run()
            onClick?.(e)
          }}
          disabled={!editor?.can().chain().focus().toggleItalic().run()}
          // ref={ref}
          {...props}
        >
          {children ?? <ItalicIcon className='h-4 w-4' />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>Italic</span>
        <span className='ml-1 text-xs text-gray-11'>(cmd + i)</span>
      </TooltipContent>
    </Tooltip>
  )
}
