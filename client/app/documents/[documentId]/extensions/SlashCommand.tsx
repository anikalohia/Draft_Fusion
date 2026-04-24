import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Heading1, Heading2, Heading3, List, ListOrdered, Image, Table, Code, CheckSquare } from 'lucide-react';

// Commands List
export const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: 'Heading 1',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
            },
            icon: <Heading1 size={18} />,
        },
        {
            title: 'Heading 2',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
            },
            icon: <Heading2 size={18} />,
        },
        {
            title: 'Bullet List',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
            },
            icon: <List size={18} />,
        },
        {
            title: 'Numbered List',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
            },
            icon: <ListOrdered size={18} />,
        },
        {
            title: 'Task List',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleTaskList().run();
            },
            icon: <CheckSquare size={18} />,
        },
        {
            title: 'Code Block',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
            },
            icon: <Code size={18} />,
        },
        {
            title: 'Table',
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            },
            icon: <Table size={18} />,
        },
    ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
};

// Menu Component
const CommandList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
                return true;
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % props.items.length);
                return true;
            }
            if (event.key === 'Enter') {
                selectItem(selectedIndex);
                return true;
            }
            return false;
        },
    }));

    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-w-48 overflow-hidden z-[9999]">
            {props.items.length > 0 ? (
                props.items.map((item: any, index: number) => (
                    <button
                        key={index}
                        onClick={() => selectItem(index)}
                        className={`p-3 text-left font-bold uppercase flex items-center gap-3 transition-colors ${
                            index === selectedIndex ? 'bg-[#FFD700]' : 'hover:bg-[#F1F1F1]'
                        } ${index !== props.items.length - 1 ? 'border-b-2 border-black' : ''}`}
                    >
                        {item.icon}
                        {item.title}
                    </button>
                ))
            ) : (
                <div className="p-3 font-bold text-gray-400 uppercase">No results</div>
            )}
        </div>
    );
});
CommandList.displayName = 'CommandList';

export const SlashCommand = Extension.create({
    name: 'slash-command',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

export const suggestion = {
    items: getSuggestionItems,
    render: () => {
        let component: any;
        let popup: any;

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(CommandList, {
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                });
            },

            onUpdate(props: any) {
                component.updateProps(props);

                if (!props.clientRect) {
                    return;
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                });
            },

            onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                    popup[0].hide();
                    return true;
                }
                return component.ref?.onKeyDown(props);
            },

            onExit() {
                popup[0].destroy();
                component.destroy();
            },
        };
    },
};
