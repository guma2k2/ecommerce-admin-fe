import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BoldIcon, Italic, ItalicIcon } from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'
import { Button } from '~/components/ui/button'

const MenuBar = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null
  }

  return (
    <div className='control-group'>
      <div className='Button-group'>
        <Button
          type='button'
          variant={'secondary'}
          size={'icon'}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          <BoldIcon />
        </Button>
        <Button
          type='button'
          variant={'secondary'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          <ItalicIcon />
        </Button>
        {/* <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          Strike
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'is-active' : ''}
        >
          Code
        </Button>
        <Button onClick={() => editor.chain().focus().unsetAllMarks().run()}>Clear marks</Button>
        <Button onClick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</Button>
        <Button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
        >
          Paragraph
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
        >
          H4
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
        >
          H5
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
        >
          H6
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          Bullet list
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          Ordered list
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
        >
          Code block
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
        >
          Blockquote
        </Button>
        <Button onClick={() => editor.chain().focus().setHorizontalRule().run()}>Horizontal rule</Button>
        <Button onClick={() => editor.chain().focus().setHardBreak().run()}>Hard break</Button>
        <Button onClick={() => editor.chain().focus().undo().run()}>Undo</Button>
        <Button onClick={() => editor.chain().focus().redo().run()}>Redo</Button> */}
      </div>
    </div>
  )
}
export default function TextEditor() {
  const editor = useEditor({
    extensions: [StarterKit], // define your extension array
    content: '<p>Hello World!</p>' // initial content
  })

  return (
    <Fragment>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </Fragment>
  )
}
