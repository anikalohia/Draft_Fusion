import {create} from 'zustand';
import { type Editor } from '@tiptap/react';

interface RemoteCursor {
    userId: string;
    userName: string;
    cursorPosition: number;
    color: string;
}

interface EditorState {
    editor: Editor | null;
    setEditor: (editor: Editor | null) => void;
    remoteCursors: Record<string, RemoteCursor>;
    setRemoteCursor: (userId: string, cursor: RemoteCursor) => void;
    removeRemoteCursor: (userId: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    editor: null,
    setEditor: (editor) => set({ editor }),
    remoteCursors: {},
    setRemoteCursor: (userId, cursor) => 
        set((state) => ({ 
            remoteCursors: { ...state.remoteCursors, [userId]: cursor } 
        })),
    removeRemoteCursor: (userId) => 
        set((state) => {
            const newCursors = { ...state.remoteCursors };
            delete newCursors[userId];
            return { remoteCursors: newCursors };
        }),
}));
