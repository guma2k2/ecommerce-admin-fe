import { Editor, EditorContent, Extension, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import { cn } from '~/lib/utils'
import EditorToolbar from '~/components/tiptap/toolbars/EditorToolbar'
import './tiptap.css'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal'
      }
    },
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc'
      }
    },
    heading: {
      levels: [1, 2, 3, 4]
    }
  }),
  Placeholder.configure({
    emptyNodeClass: 'is-editor-empty',
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case 'heading':
          return `Heading ${node.attrs.level}`
        case 'detailsSummary':
          return 'Section title'
        case 'codeBlock':
          // never show the placeholder when editing code
          return ''
        default:
          return "Write, type '/' for commands"
      }
    },
    includeChildren: false
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph']
  }),
  // TextStyle,
  // Subscript,
  // Superscript,
  // Underline,
  Link
  // Color,
  // Highlight.configure({
  //   multicolor: true,
  // }),
  // ImageExtension,
  // ImagePlaceholder,
  // SearchAndReplace,
  // Typography,
]

type TextEditorProps = {
  className?: string
}
export default function TextEditor({ className }: TextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions as Extension[],
    content: '<p>Hello world</p>',
    editorProps: {
      attributes: {
        class: 'max-w-full focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      console.log(editor.getHTML())
    }
  })

  if (!editor) return null

  return (
    <div className={cn('relative w-full border bg-card flex flex-col h-60 ', className)}>
      <EditorToolbar editor={editor} />
      <div className='flex-1 overflow-y-auto'>
        <EditorContent editor={editor} className='min-h-40 w-full cursor-text p-3' />
      </div>
    </div>
  )
}
