import { useState } from "react"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"

export function TextEditor() {
  const [value, setValue] = useState("")
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "check" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"]
    ]
  }
  const formats = ["header", "bold", "italic", "underline", "strike", "blockquote", "list", "indent", "link", "image"]
  return <ReactQuill theme='snow' value={value} onChange={setValue} formats={formats} modules={modules} />
}
