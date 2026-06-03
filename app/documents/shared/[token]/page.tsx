'use client'
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { ShieldCheckIcon, AlertTriangleIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function SharedDocumentPage() {
    const params = useParams();
    const shareToken = params.token as string;
    const router = useRouter();
    const { token: authToken } = useAuth();
    const [status, setStatus] = useState<'loading' | 'error' | 'redirecting'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const storedToken = authToken || localStorage.getItem('token');

        if (!storedToken) {
            // Not logged in — redirect to login with return URL
            router.push(`/login?redirect=/documents/shared/${shareToken}`);
            return;
        }

        const accessDoc = async () => {
            try {
                const res = await fetch(`${API_URL}/api/docs/shared/${shareToken}`, {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });
                const data = await res.json();

                if (data.success) {
                    setStatus('redirecting');
                    router.push(`/documents/${data.documentId}`);
                } else {
                    setStatus('error');
                    setErrorMessage(data.message || 'Failed to access document');
                }
            } catch (err) {
                setStatus('error');
                setErrorMessage('Network error. Please try again.');
            }
        };

        accessDoc();
    }, [shareToken, authToken, router]);

    return (
        <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center font-sans">
            <div className="w-[480px] bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                {/* Header */}
                <div className={`p-6 border-b-4 border-black ${status === 'error' ? 'bg-[#FF4D4D]' : 'bg-[#4D7CFE]'}`}>
                    <h1 className="text-3xl font-black uppercase text-white tracking-tight">
                        {status === 'error' ? 'Access Denied' : 'Secure Share'}
                    </h1>
                </div>

                <div className="p-10 space-y-6">
                    {status === 'loading' && (
                        <>
                            <Loader2Icon size={48} className="animate-spin mx-auto" />
                            <p className="text-lg font-black uppercase">Verifying Access...</p>
                            <p className="text-sm font-bold text-gray-400">Checking your permissions</p>
                        </>
                    )}

                    {status === 'redirecting' && (
                        <>
                            <ShieldCheckIcon size={48} className="mx-auto text-[#00FF00]" />
                            <p className="text-lg font-black uppercase">Access Granted!</p>
                            <p className="text-sm font-bold text-gray-400">Redirecting to document...</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <AlertTriangleIcon size={48} className="mx-auto text-[#FF4D4D]" />
                            <p className="text-lg font-black uppercase">Cannot Access</p>
                            <p className="text-sm font-bold text-gray-500">{errorMessage}</p>
                            <Link
                                href="/dashboard"
                                className="inline-block mt-4 bg-black text-white px-8 py-3 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(77,124,254,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-sm uppercase"
                            >
                                Go to Dashboard
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
