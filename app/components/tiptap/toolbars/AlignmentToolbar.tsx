import { useEditorState } from '@tiptap/react'
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Check, ChevronDown } from 'lucide-react'
import { useToolbar } from '~/components/tiptap/toolbars/ToolbarProvider'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

export default function AlignmentToolbar() {
  const { editor } = useToolbar()
  const handleAlign = (value: string) => {
    editor.chain().focus().setTextAlign(value).run()
  }

  const isDisabled = editor?.isActive('image') ?? editor?.isActive('video') ?? false

  const textAlign = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (editor.isActive({ textAlign: 'left' })) return 'left'
      if (editor.isActive({ textAlign: 'center' })) return 'center'
      if (editor.isActive({ textAlign: 'right' })) return 'right'
      if (editor.isActive({ textAlign: 'justify' })) return 'justify'
      return 'left'
    }
  })

  const alignmentOptions = [
    {
      name: 'Left Align',
      value: 'left',
      icon: <AlignLeft className='h-4 w-4' />
    },
    {
      name: 'Center Align',
      value: 'center',
      icon: <AlignCenter className='h-4 w-4' />
    },
    {
      name: 'Right Align',
      value: 'right',
      icon: <AlignRight className='h-4 w-4' />
    },
    {
      name: 'Justify Align',
      value: 'justify',
      icon: <AlignJustify className='h-4 w-4' />
    }
  ]

  const findIndex = (value: string) => {
    return alignmentOptions.findIndex((option) => option.value === value)
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger disabled={isDisabled} asChild>
            <Button variant='ghost' size='sm' className='h-8 w-max font-normal' type='button'>
              <span className='mr-2'>{alignmentOptions[findIndex(textAlign)]?.icon}</span>
              <ChevronDown className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Text Alignment</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        loop
        className='!min-w-15'
        onCloseAutoFocus={(e) => {
          e.preventDefault()
        }}
      >
        <DropdownMenuGroup className='!min-w-15'>
          {alignmentOptions.map((option, index) => (
            <DropdownMenuItem
              onSelect={() => {
                handleAlign(option.value)
              }}
              key={index}
            >
              <span className='mr-2'>{option.icon}</span>
              {option.value === textAlign && <Check className='ml-auto h-4 w-4' />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
