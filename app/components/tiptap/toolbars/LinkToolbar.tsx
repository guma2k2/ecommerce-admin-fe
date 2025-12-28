import { useEditorState } from '@tiptap/react'
import { Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useToolbar } from '~/components/tiptap/toolbars/ToolbarProvider'
import { Button, type ButtonProps } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn, getUrlFromString } from '~/utils/appUtils'
type LinkToolbarProps = ButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string
  }
export default function LinkToolbar({ className, onClick, ...props }: LinkToolbarProps) {
  const { editor } = useToolbar()
  const [link, setLink] = useState<string>('')
  const isActive = useEditorState({
    editor,
    selector: () => editor?.isActive('link')
  })

  const linkValue = useEditorState({
    editor,
    selector: ({ editor }) => editor.getAttributes('link').href ?? ''
  })

  const handleConfirm = () => {
    const url = getUrlFromString(link)
    if (!url) return

    editor?.chain().focus().setLink({ href: url }).run()
  }

  useEffect(() => {
    setLink(linkValue)
  }, [linkValue])

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger disabled={!editor?.can().chain().setLink({ href: '' }).run()} asChild>
            <Button
              variant='ghost'
              size='sm'
              type='button'
              className={cn('h-8 w-max px-3 font-normal', isActive && 'bg-accent', className)}
              {...props}
            >
              <p className='mr-2 text-base'>↗</p>
              <p className={'underline decoration-gray-7 underline-offset-4'}>Link</p>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span>Link</span>
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        onCloseAutoFocus={(e) => {
          e.preventDefault()
        }}
        asChild
        className='relative px-3 py-2.5'
      >
        <div className='relative'>
          <div>
            <Label>Link</Label>
            <p className='text-sm text-gray-11'>Attach a link to the selected text</p>
            <div className='mt-3 flex flex-col items-end justify-end gap-3'>
              <Input
                value={link}
                onChange={(e) => {
                  setLink(e.target.value)
                }}
                className='w-full'
                placeholder='https://example.com'
              />
              <div className='flex items-center gap-3'>
                {editor?.getAttributes('link').href && (
                  <Button
                    type='reset'
                    size='sm'
                    className='h-8 text-gray-11'
                    variant='ghost'
                    onClick={() => {
                      editor?.chain().focus().unsetLink().run()
                      setLink('')
                    }}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Remove
                  </Button>
                )}
                <Button size='sm' className='h-8' type='button' onClick={handleConfirm}>
                  {editor?.getAttributes('link').href ? 'Update' : 'Confirm'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
