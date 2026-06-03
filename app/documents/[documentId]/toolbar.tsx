"use client"
import { useEditorStore } from "@/app/store/use-editor-store";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { DropdownMenu,DropdownMenuItem,DropdownMenuContent,DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { BoldIcon, ChevronDownIcon, ItalicIcon, ListTodoIcon, LucideIcon, MessageSquarePlusIcon, PrinterIcon, Redo2Icon, RemoveFormattingIcon, SpellCheckIcon, UnderlineIcon, Undo2Icon } from "lucide-react"

const FontFamilyButton = ()=>{
    const {editor} = useEditorStore();
    const fonts = [
        {label: "Arial",value:"Arial"},
        {label:"Times New Roman", value:"Times New Roman"},
        {label:"Courier New", value:"Courier New"},
        {label:"Georgia", value:"Georgia"},
        {label:"Verdana", value:"Verdana"},
    ]
    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={
                    "h-7 w-30 shrink-0 flex items-center justify-between rounded-sm hover:bg-neutral-200/80 px-1.5 overflow-hidden text-sm"
                }>
                    <span className="truncate">
                        {editor?.getAttributes("textStyle").fontFamily || "Arial"}
                    </span>
                    <ChevronDownIcon className="ml-2 size-4 shrink-0"/>

                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1">
                {fonts.map(({label,value})=>(
                    <button 
                    onClick = {()=> editor?.chain().focus().setFontFamily(value).run()}
                     key = {value}
                    className={cn("flex items-center gap-x-22 py-1 rounded-sm hover:bg-neutral-200/80",
                        editor?.getAttributes('textStyle').fontFamily === value && "bg-neutral-200/80"
                    )}
                    style={{fontFamily: value}}
                    >
                        <span className="text-sm">{label}</span>
                    </button>

                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
interface ToolbarButtonProps{
    onClick? : ()=> void;
    isActive? : boolean;
    icon : LucideIcon;
}

const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon,

}: ToolbarButtonProps)=>{
    return(
        <button onClick={onClick}
        className={cn(
            "text-sm h-7 min-w-7 flex items-center rounded-sm hover:bg-neutral-200/80",isActive && "bg-neutral-200/80"
        )}>

            <Icon className="size-4"/>
        </button>
    )

}

export const Toolbar = ()=>{
    const {editor} = useEditorStore();
    const sections: {
        label:string;
        icon:LucideIcon;
        onClick: ()=>void;
        isActive?: boolean;
    }[][]=[
        [
            {
                label: "Undo",
                icon: Undo2Icon,
                onClick:()=> editor?.chain().focus().undo().run(),
            },
            {
                label: "Redo",
                icon: Redo2Icon,
                onClick:()=> editor?.chain().focus().redo().run(),
            },
            {
                label: "Print",
                icon: PrinterIcon,
                onClick:()=> window.print(),
            },
            {
                label: "Spell Check",
                icon: SpellCheckIcon,
                onClick:()=> {
                    const current = editor?.view.dom.getAttribute("spellcheck");
                    editor?.view.dom.setAttribute("spellcheck",current==="false"?"true":"false")
                },
            }
        ],
        [
            {
                label: "Bold",
                icon: BoldIcon,
                isActive:editor?.isActive("bold"),
                onClick:()=> editor?.chain().focus().toggleBold().run(),
            },
            {
                label: "Italic",
                icon: ItalicIcon,
                isActive:editor?.isActive("italic"),
                onClick:()=> editor?.chain().focus().toggleItalic().run(),
            },
            {
                label: "Underline",
                icon: UnderlineIcon,
                isActive:editor?.isActive("underline"),
                onClick:()=> editor?.chain().focus().toggleUnderline().run(),
            }
        ],
        [
           {
                label: "Comments",
                icon: MessageSquarePlusIcon,
                isActive:false,
                onClick:()=> console.log("Comment"),
            },
            {
                label: "List Todo",
                icon: ListTodoIcon,
                onClick:()=> editor?.chain().toggleTaskList().run(),
                isActive: editor?.isActive("taskList")
            },
            {
                label: "Remove Formatting",
                icon: RemoveFormattingIcon,
                onClick:()=> editor?.chain().unsetAllMarks().run(),
                
            }

            
        ]
    ]
    return (
        <div className="bg-white px-3 py-2 rounded-none border-4 border-black min-h-[48px] flex items-center gap-x-1.5 overflow-x-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {
                sections[0].map((item)=>(
                    <ToolbarButton key={item.label}{...item}/>
                ))
            }
            <Separator orientation="vertical" className="h-8 bg-black w-[2px]" />
            
            <FontFamilyButton/>
            <Separator orientation="vertical" className="h-8 bg-black w-[2px]" />
            {/*TODO: Heading*/}
            <Separator orientation="vertical" className="h-8 bg-black w-[2px]" />
            {/*TODO: Font size */}
            <Separator orientation="vertical" className="h-8 bg-black w-[2px]" />
            {sections[1].map((item)=>(
                <ToolbarButton key={item.label}{...item}/>
            ))}

            {/*TODO: Highlight color*/}
            <Separator orientation="vertical" className="h-8 bg-black w-[2px]" />
            {sections[2].map((item)=>(
                <ToolbarButton key={item.label}{...item}/>
            ))}
        </div>
    )
}