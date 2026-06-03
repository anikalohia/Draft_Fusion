'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { XIcon, LinkIcon, CopyIcon, Trash2Icon, UserPlusIcon, ShieldCheckIcon, UnlinkIcon, CheckIcon, AlertTriangleIcon } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface SharedUser {
    _id: string;
    user: {
        _id: string;
        username: string;
        email: string;
    };
    permission: string;
    sharedAt: string;
}

interface ShareModalProps {
    documentId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ShareModal = ({ documentId, isOpen, onClose }: ShareModalProps) => {
    const { token } = useAuth();
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('editor');
    const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
    const [shareToken, setShareToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    useEffect(() => {
        if (isOpen) {
            fetchSharedUsers();
        }
    }, [isOpen]);

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const fetchSharedUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/docs/${documentId}/share`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success) {
                setSharedUsers(data.sharedWith || []);
                setShareToken(data.shareToken || null);
            }
        } catch (err) {
            console.error('Failed to fetch shared users:', err);
        }
    };

    const handleInvite = async () => {
        if (!email.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/docs/${documentId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ email: email.trim(), permission })
            });
            const data = await res.json();
            if (data.success) {
                setSharedUsers(data.sharedWith);
                setEmail('');
                showMessage('User invited successfully!', 'success');
            } else {
                showMessage(data.message || 'Failed to invite user', 'error');
            }
        } catch (err) {
            showMessage('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/docs/${documentId}/share/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success) {
                setSharedUsers(data.sharedWith);
                showMessage('User removed', 'success');
            }
        } catch (err) {
            showMessage('Failed to remove user', 'error');
        }
    };

    const handleGenerateLink = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/docs/${documentId}/generate-link`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success) {
                setShareToken(data.shareToken);
                showMessage('Share link generated!', 'success');
            }
        } catch (err) {
            showMessage('Failed to generate link', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeLink = async () => {
        try {
            const res = await fetch(`${API_URL}/api/docs/${documentId}/revoke-link`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success) {
                setShareToken(null);
                showMessage('Share link revoked', 'success');
            }
        } catch (err) {
            showMessage('Failed to revoke link', 'error');
        }
    };

    const copyShareLink = () => {
        const link = `${window.location.origin}/documents/shared/${shareToken}`;
        navigator.clipboard.writeText(link);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[100]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[520px] max-h-[85vh] overflow-y-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-4 border-black bg-[#4D7CFE]">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">Share Document</h2>
                    <button
                        onClick={onClose}
                        className="p-2 border-2 border-black bg-white hover:bg-[#FF4D4D] hover:text-white transition-colors"
                    >
                        <XIcon size={20} />
                    </button>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`mx-6 mt-4 p-3 border-2 border-black font-bold text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-[#00FF00]' : 'bg-[#FF4D4D] text-white'
                        }`}>
                        {message.type === 'success' ? <CheckIcon size={16} /> : <AlertTriangleIcon size={16} />}
                        {message.text}
                    </div>
                )}

                {/* Invite by Email Section */}
                <div className="p-6 border-b-4 border-black">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">Invite by Email</h3>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                            className="flex-1 px-4 py-3 border-4 border-black font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-300"
                        />
                        <select
                            value={permission}
                            onChange={(e) => setPermission(e.target.value)}
                            className="px-3 py-3 border-4 border-black font-black text-xs uppercase bg-[#F1F1F1] cursor-pointer focus:outline-none"
                        >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>
                    <button
                        onClick={handleInvite}
                        disabled={loading || !email.trim()}
                        className="mt-3 w-full bg-[#FFD700] text-black px-6 py-3 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                    >
                        <UserPlusIcon size={18} />
                        {loading ? 'INVITING...' : 'INVITE'}
                    </button>
                </div>

                {/* Shared Users List */}
                <div className="p-6 border-b-4 border-black">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">
                        People with Access ({sharedUsers.length})
                    </h3>
                    {sharedUsers.length === 0 ? (
                        <p className="text-sm font-bold text-gray-300 italic">No one else has access yet</p>
                    ) : (
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                            {sharedUsers.map((s) => (
                                <div key={s._id} className="flex items-center justify-between p-3 border-2 border-black bg-[#F9F9F9] hover:bg-[#F1F1F1] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#4D7CFE] border-2 border-black flex items-center justify-center text-white font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            {s.user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm">@{s.user.username}</p>
                                            <p className="text-xs font-bold text-gray-400">{s.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black px-2 py-1 border border-black uppercase ${s.permission === 'editor' ? 'bg-[#00FF00]' : 'bg-[#FFD700]'
                                            }`}>
                                            {s.permission}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveUser(s.user._id)}
                                            className="p-1.5 border-2 border-black hover:bg-[#FF4D4D] hover:text-white transition-colors"
                                        >
                                            <Trash2Icon size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Secure Share Link Section */}
                <div className="p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                        <ShieldCheckIcon size={16} />
                        Secure Share Link
                    </h3>

                    {shareToken ? (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1 px-4 py-3 border-4 border-black bg-[#F1F1F1] font-mono text-xs truncate">
                                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/documents/shared/${shareToken}`}
                                </div>
                                <button
                                    onClick={copyShareLink}
                                    className="px-4 py-3 border-4 border-black bg-[#00FF00] hover:bg-[#00DD00] transition-colors font-black"
                                    title="Copy link"
                                >
                                    {linkCopied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                                </button>
                            </div>
                            <button
                                onClick={handleRevokeLink}
                                className="w-full bg-[#FF4D4D] text-white px-6 py-3 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 text-sm uppercase"
                            >
                                <UnlinkIcon size={18} />
                                Revoke Link
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerateLink}
                            disabled={loading}
                            className="w-full bg-black text-white px-6 py-3 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(77,124,254,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 text-sm uppercase disabled:opacity-50"
                        >
                            <LinkIcon size={18} />
                            Generate Share Link
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};
