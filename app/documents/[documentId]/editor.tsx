'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import Image from '@tiptap/extension-image'
import ImageResize from 'tiptap-extension-resize-image';
import { useEditorStore } from '@/app/store/use-editor-store'
import { FontFamily } from '@tiptap/extension-text-style/font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import { socket } from '@/lib/socket'
import { useAuth } from '@/app/context/AuthContext'
import { API_URL } from '@/lib/api'
import { SlashCommand, suggestion } from './extensions/SlashCommand'
import Typography from '@tiptap/extension-typography'

export const Editor = () => {
    const { setEditor, setRemoteCursor, removeRemoteCursor } = useEditorStore();
    const params = useParams();
    const documentId = params.documentId as string;
    const isRemoteUpdate = useRef(false);
    const { user } = useAuth();
    const [remoteCursors, setRemoteCursors] = useState<any[]>([]);
    const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
    const [canEdit, setCanEdit] = useState(true);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const editor = useEditor({
        onCreate({ editor }) {
            setEditor(editor);
        },
        onDestroy() {
            setEditor(null);
        },
        onUpdate({ editor }) {
            setEditor(editor);
            
            if (!isRemoteUpdate.current && canEdit) {
                const content = editor.getJSON();
                socket.emit('document_change', { documentId, content });
                debounceSave(content);

                // Handle Typing Indicator
                if (user) {
                    socket.emit('typing', { documentId, userId: user.id, username: user.username });
                    
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                        socket.emit('stop_typing', { documentId, userId: user.id });
                    }, 2000);
                }
            }
            isRemoteUpdate.current = false;
        },
        onSelectionUpdate({ editor }) {
            if (user && documentId) {
                const { from } = editor.state.selection;
                // Get absolute coordinates for cursor (simplified for basic sync)
                socket.emit('cursor_update', { 
                    documentId, 
                    cursorPosition: from, 
                    userId: user.id, 
                    userName: user.username,
                });
            }
        },
        extensions: [
            TableKit,
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            FontFamily,
            TextStyle,
            Typography,
            SlashCommand.configure({
                suggestion,
            }),
            TaskItem.configure({
                nested: true,
            }),
            TaskList,
            Image,
            ImageResize
        ],
        editorProps: {
            attributes: {
                style: "padding-left:56px; padding-right:56px",
                class: "focus:outline-none print:border-0 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text relative"
            }
        },
        immediatelyRender: false,
        editable: canEdit,
    });

    useEffect(() => {
        if (editor) {
            editor.setEditable(canEdit);
        }
    }, [canEdit, editor]);

    // Auto-save logic (simple debounce)
    const debounceSaveRef = useRef<NodeJS.Timeout | null>(null);
    const debounceSave = (content: any) => {
        if (!canEdit) return;
        if (debounceSaveRef.current) clearTimeout(debounceSaveRef.current);
        debounceSaveRef.current = setTimeout(async () => {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${API_URL}/api/docs/${documentId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ content })
                });
                console.log('Document auto-saved');
            } catch (err) {
                console.error('Auto-save failed:', err);
            }
        }, 2000);
    };

    useEffect(() => {
        if (!documentId || !editor || !user) return;

        const fetchDoc = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/docs/${documentId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    if (data.document.content) {
                        isRemoteUpdate.current = true;
                        editor.commands.setContent(data.document.content);
                    }
                    
                    // Determine if user can edit
                    const isOwner = data.isOwner;
                    const sharedEntry = data.document.sharedWith.find((s: any) => s.user === user.id || s.user._id === user.id);
                    const isEditor = isOwner || (sharedEntry && sharedEntry.permission === 'editor') || data.document.collaborators.includes(user.id);
                    setCanEdit(!!isEditor);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchDoc();
        
        socket.connect();
        socket.emit('join_document', { documentId, user });

        socket.on('receive_change', (content) => {
            if (editor && content) {
                isRemoteUpdate.current = true;
                const { from, to } = editor.state.selection;
                editor.commands.setContent(content, { emitUpdate: false });
                const maxPos = editor.state.doc.content.size;
                editor.commands.setTextSelection({
                    from: Math.min(from, maxPos),
                    to: Math.min(to, maxPos)
                });
            }
        });

        socket.on('receive_cursor', (data) => {
            setRemoteCursor(data.userId, data);
            setRemoteCursors(prev => {
                const existing = prev.findIndex(c => c.userId === data.userId);
                if (existing !== -1) {
                    const newCursors = [...prev];
                    newCursors[existing] = data;
                    return newCursors;
                }
                return [...prev, data];
            });
        });

        socket.on('active_users', (users) => {
            // Update colors for remote cursors based on active_users
            setRemoteCursors(prev => prev.map(c => {
                const u = users.find((user: any) => user.id === c.userId);
                return u ? { ...c, color: u.color } : c;
            }));
        });

        socket.on('user_typing', ({ userId, username }) => {
            if (userId !== user.id) {
                setTypingUsers(prev => ({ ...prev, [userId]: username }));
            }
        });

        socket.on('user_stopped_typing', ({ userId }) => {
            setTypingUsers(prev => {
                const newTyping = { ...prev };
                delete newTyping[userId];
                return newTyping;
            });
        });

        return () => {
            socket.off('receive_change');
            socket.off('receive_cursor');
            socket.off('active_users');
            socket.off('user_typing');
            socket.off('user_stopped_typing');
            socket.disconnect();
        };
    }, [documentId, editor, user, setRemoteCursor, removeRemoteCursor]);

    return (
        <div className='size-full overflow-x-auto bg-[#F9F9F9] px-4 print:p-0 print:bg-white print:overflow-visible py-8 relative'>
            <div className='min-w-max flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0 relative'>
                <EditorContent editor={editor} />
                
                {/* Typing Indicators Floating */}
                <div className="fixed bottom-10 right-10 flex flex-col items-end gap-2 pointer-events-none z-50">
                    {Object.values(typingUsers).map((username, i) => (
                        <div key={i} className="bg-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                            <span className="font-bold text-sm">{username} is typing...</span>
                        </div>
                    ))}
                </div>

                {/* Render Remote Cursors (Simplified) */}
                {editor && remoteCursors.map(cursor => {
                    // This is a simplified approach. In a real app, you'd use editor.view.coordsAtPos
                    // to place the cursor exactly. For this turn, I'll keep it as a logical concept.
                    return null; 
                })}
            </div>
        </div>
    )
}
