'use client'
import React, { useEffect, useState, useRef } from 'react';
import { socket } from '@/lib/socket';
import { useAuth } from '@/app/context/AuthContext';
import { ShareIcon, UsersIcon, HomeIcon, SaveIcon, DownloadIcon, ChevronDownIcon } from 'lucide-react';
import Link from 'next/link';
import { ShareModal } from './ShareModal';
import { useEditorStore } from '@/app/store/use-editor-store';

export const DocumentHeader = ({ documentId }: { documentId: string }) => {
    const { editor, remoteCursors } = useEditorStore();
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const [title, setTitle] = useState('Untitled Document');
    const [isPublic, setIsPublic] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const { user, token } = useAuth();
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/docs/${documentId}`, {
                    headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success) {
                    setTitle(data.document.title);
                    setIsPublic(data.document.isPublic);
                    setIsOwner(data.isOwner);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchDoc();

        const handleActiveUsers = (users: any[]) => {
            setActiveUsers(users);
        };

        socket.on('active_users', handleActiveUsers);

        return () => {
            socket.off('active_users', handleActiveUsers);
        };
    }, [documentId, token]);

    const handleShare = () => {
        if (isOwner) {
            setShowShareModal(true);
        } else {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const followUser = (userId: string) => {
        const cursor = remoteCursors[userId];
        if (cursor && editor) {
            editor.commands.focus();
            editor.commands.scrollIntoView();
            // We use a small hack to scroll to a specific position if scrollIntoView is too generic
            const node = editor.view.domAtPos(cursor.cursorPosition).node;
            if (node instanceof HTMLElement) {
                node.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (node.parentElement) {
                node.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportAsJSON = () => {
        if (!editor) return;
        const json = JSON.stringify(editor.getJSON(), null, 2);
        downloadFile(json, `${title}.json`, 'application/json');
    };

    const exportAsHTML = () => {
        if (!editor) return;
        const html = `
            <!DOCTYPE html>
            <html>
            <head><title>${title}</title><style>body{font-family:sans-serif;padding:2rem;}</style></head>
            <body>${editor.getHTML()}</body>
            </html>
        `;
        downloadFile(html, `${title}.html`, 'text/html');
    };

    const exportAsMarkdown = () => {
        if (!editor) return;
        // Simple markdown conversion (best effort without external lib)
        const text = editor.getText();
        downloadFile(text, `${title}.md`, 'text/markdown');
    };

    const exportAsPDF = () => {
        window.print();
    };

    const updateTitle = async (newTitle: string) => {
        setTitle(newTitle);
        setSaving(true);
        try {
            await fetch(`http://localhost:5000/api/docs/${documentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || localStorage.getItem('token')}`
                },
                body: JSON.stringify({ title: newTitle })
            });
        } catch (err) {
            console.error(err);
        } finally {
            setTimeout(() => setSaving(false), 500);
        }
    };

    const togglePrivacy = async () => {
        if (!isOwner) return;
        const newStatus = !isPublic;
        setIsPublic(newStatus);
        setSaving(true);
        try {
            await fetch(`http://localhost:5000/api/docs/${documentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || localStorage.getItem('token')}`
                },
                body: JSON.stringify({ isPublic: newStatus })
            });
        } catch (err) {
            console.error(err);
        } finally {
            setTimeout(() => setSaving(false), 500);
        }
    };

    return (
        <div className="bg-white border-b-4 border-black p-4 flex justify-between items-center z-50 relative sticky top-0">
            <div className="flex items-center gap-6">
                <Link href="/dashboard" className="p-2 border-2 border-black hover:bg-[#FFD700] transition-colors">
                    <HomeIcon size={24} />
                </Link>

                <div className="flex flex-col">
                    <input
                        ref={titleRef}
                        type="text"
                        value={title}
                        onChange={(e) => updateTitle(e.target.value)}
                        className="text-2xl font-black uppercase tracking-tighter bg-transparent focus:outline-none border-b-2 border-transparent focus:border-black w-64 md:w-96"
                        placeholder="UNTITLED DOCUMENT"
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            ID: {documentId.slice(-8)}
                        </span>
                        {isOwner && (
                            <button
                                onClick={togglePrivacy}
                                className={`text-[10px] font-black px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase ${isPublic ? 'bg-[#00FF00]' : 'bg-[#FF4D4D] text-white'}`}
                            >
                                {isPublic ? 'PUBLIC (Anyone with link)' : 'PRIVATE (Only me)'}
                            </button>
                        )}
                        {saving && <SaveIcon size={10} className="animate-spin" />}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* User Avatars */}
                <div className="flex items-center gap-2 bg-[#F1F1F1] px-3 py-1 border-2 border-black">
                    <UsersIcon size={16} />
                    <div className="flex -space-x-1">
                        {activeUsers.map((u) => (
                            <div
                                key={u.id}
                                onClick={() => followUser(u.id)}
                                className="w-8 h-8 rounded-none border-2 border-black flex items-center justify-center text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:-translate-y-1 transition-transform"
                                style={{ backgroundColor: u.color }}
                                title={`Click to follow ${u.username}`}
                            >
                                {u.username.charAt(0).toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="bg-[#FFD700] p-2 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 text-sm uppercase"
                    >
                        <DownloadIcon size={18} />
                        EXPORT
                        <ChevronDownIcon size={16} />
                    </button>
                    
                    {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[100] flex flex-col">
                            <button onClick={() => { exportAsPDF(); setShowExportMenu(false); }} className="p-3 text-left font-bold uppercase hover:bg-[#FFD700] border-b-2 border-black transition-colors">PDF Document</button>
                            <button onClick={() => { exportAsMarkdown(); setShowExportMenu(false); }} className="p-3 text-left font-bold uppercase hover:bg-[#FFD700] border-b-2 border-black transition-colors">Markdown (.md)</button>
                            <button onClick={() => { exportAsHTML(); setShowExportMenu(false); }} className="p-3 text-left font-bold uppercase hover:bg-[#FFD700] border-b-2 border-black transition-colors">HTML Webpage</button>
                            <button onClick={() => { exportAsJSON(); setShowExportMenu(false); }} className="p-3 text-left font-bold uppercase hover:bg-[#FFD700] transition-colors">Raw JSON</button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleShare}
                    className="bg-[#4D7CFE] text-white px-6 py-2 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 text-sm uppercase"
                >
                    <ShareIcon size={18} />
                    {copied ? 'COPIED!' : 'SHARE'}
                </button>
            </div>

            {/* Share Modal */}
            <ShareModal
                documentId={documentId}
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
            />
        </div>
    );
};
