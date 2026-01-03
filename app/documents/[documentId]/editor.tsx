'use client'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import Image from '@tiptap/extension-image'
import ImageResize from 'tiptap-extension-resize-image';
import { useEditorStore } from '@/app/store/use-editor-store'

export const Editor = ()=>{
  const {setEditor} = useEditorStore();
    const editor = useEditor({
    onCreate({editor}){
      setEditor(editor);

    },
    extensions: [
        TableKit,
        StarterKit,
        TaskItem.configure({
            nested: true,
        }),
        TaskList,
        Image,
        ImageResize
    ],
    editorProps: {
        attributes:{
            style: "padding-left:56px; padding-right:56px",
            class: "focus:outline-none print:border-0 bg-white border border-[#C7C7C7] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text "
        }
},
    content: `
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th colspan="3">Description</th>
            </tr>
            <tr>
              <td>Cyndi Lauper</td>
              <td>Singer</td>
              <td>Songwriter</td>
              <td>Actress</td>
            </tr>
          </tbody>
        </table>
      `,
    immediatelyRender: false,
    
    
    
  })
    
    return(
        <div className='size-full overflow-x-auto bg-[#F9FBFD"] px-4 print:p-0 print:bg-white print:overflow-visible'>
            <div className='min-w-max flex justify-center w-816px py-4 print:py-0 mx-auto print:w-full print:min-w-0'>
                <EditorContent editor={editor}/>
            </div>
        </div>
    )
}