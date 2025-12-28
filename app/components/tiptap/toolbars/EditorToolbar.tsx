import React from 'react'
import { Separator } from '~/components/ui/separator'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { TooltipProvider } from '~/components/ui/tooltip'
import { ToolbarProvider } from '~/components/tiptap/toolbars/ToolbarProvider'
import { Editor } from '@tiptap/core'
import BoldToolbar from '~/components/tiptap/toolbars/BoldToolbar'
import ItalicToolbar from '~/components/tiptap/toolbars/ItalicToolbar'
import UnderlineToolbar from '~/components/tiptap/toolbars/UnderlineToolbar'
import ColorHighlightToolbar from '~/components/tiptap/toolbars/ColorHighlightToolbar'
import AlignmentToolbar from '~/components/tiptap/toolbars/AlignmentToolbar'
import LinkToolbar from '~/components/tiptap/toolbars/LinkToolbar'
type EditorToolbarProps = {
  editor: Editor
}
export default function EditorToolbar({ editor }: EditorToolbarProps) {
  return (
    <div className='sticky top-0 z-20 w-full border-b bg-background hidden sm:block'>
      <ToolbarProvider editor={editor}>
        <TooltipProvider>
          <ScrollArea className='h-fit py-0.5'>
            <div>
              <div className='flex items-center gap-1 px-2'>
                <BoldToolbar />
                <ItalicToolbar />
                <UnderlineToolbar />
                {/* <ColorHighlightToolbar /> */}
                <Separator orientation='vertical' className='mx-1 h-7!' />
                <AlignmentToolbar />
                <Separator orientation='vertical' className='mx-1 h-7!' />
                <LinkToolbar />

                {/* <UndoToolbar />
                <RedoToolbar />

                <HeadingsToolbar />
                <BlockquoteToolbar />
                <CodeToolbar />
                <CodeBlockToolbar />
                <Separator orientation='vertical' className='mx-1 h-7' />

                
                <StrikeThroughToolbar />
                <LinkToolbar />
                <Separator orientation='vertical' className='mx-1 h-7' />

                <BulletListToolbar />
                <OrderedListToolbar />
                <HorizontalRuleToolbar />
                <Separator orientation='vertical' className='mx-1 h-7' />

                <Separator orientation='vertical' className='mx-1 h-7' />

                <ImagePlaceholderToolbar />
                <Separator orientation='vertical' className='mx-1 h-7' />

                <div className='flex-1' />

                <SearchAndReplaceToolbar /> */}
              </div>
            </div>
            <ScrollBar className='hidden' orientation='horizontal' />
          </ScrollArea>
        </TooltipProvider>
      </ToolbarProvider>
    </div>
  )
}
