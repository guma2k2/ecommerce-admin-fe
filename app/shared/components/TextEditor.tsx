import React, { useMemo } from "react"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"
import { cn } from "~/shared/utils"

export interface TextEditorProps {
  id?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  readOnly?: boolean
  className?: string
}

export function TextEditor({
  id,
  value = "",
  onChange,
  onBlur,
  placeholder,
  readOnly = false,
  className
}: TextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
        ["link", "image"],
        ["clean"]
      ]
    }),
    []
  )

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "indent",
      "link",
      "image"
    ],
    []
  )

  const handleChange = (content: string) => {
    // When Quill is cleared, it emits "<p><br></p>". Normalize this to empty string ""
    const normalized = content === "<p><br></p>" ? "" : content
    onChange?.(normalized)
  }

  return (
    <div
      id={id}
      className={cn(
        "rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors",
        "[&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 dark:[&_.ql-toolbar]:border-zinc-700 [&_.ql-toolbar]:bg-gray-50/75 dark:[&_.ql-toolbar]:bg-zinc-800/60",
        "[&_.ql-container]:border-none [&_.ql-container]:text-sm [&_.ql-editor]:min-h-[160px] [&_.ql-editor]:text-gray-800 dark:[&_.ql-editor]:text-gray-200",
        "[&_.ql-stroke]:dark:stroke-zinc-300 [&_.ql-fill]:dark:fill-zinc-300 [&_.ql-picker]:dark:text-zinc-300",
        className
      )}
    >
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        readOnly={readOnly}
        formats={formats}
        modules={modules}
      />
    </div>
  )
}

export default TextEditor

