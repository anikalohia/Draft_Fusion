'use client'
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon, FileTextIcon, SearchIcon, Trash2Icon, LayoutDashboardIcon, SettingsIcon, LogOutIcon } from 'lucide-react';

export default function Dashboard() {
    const { user, token, logout } = useAuth();
    const router = useRouter();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!token && !localStorage.getItem('token')) {
            router.push('/login');
            return;
        }

        const fetchDocs = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/docs/user/${user?.id || JSON.parse(localStorage.getItem('user') || '{}').id}`, {
                    headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
                });
                const data = await res.json();
                if (data.success) {
                    setDocuments(data.documents);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, [token, user, router]);

    const createDoc = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/docs', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ title: 'Untitled Document' })
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/documents/${data.document._id}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteDoc = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this document?')) return;
        
        try {
            const res = await fetch(`http://localhost:5000/api/docs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setDocuments(docs => docs.filter(d => d._id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-10 font-black text-6xl animate-pulse">LOADING...</div>;

    return (
        <div className="min-h-screen bg-[#F9F9F9] flex font-sans">
            {/* Sidebar */}
            <aside className="w-80 border-r-4 border-black bg-white flex flex-col sticky top-0 h-screen">
                <div className="p-8 border-b-4 border-black bg-[#FFD700]">
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">DF.</h1>
                </div>
                
                <nav className="flex-1 p-6 space-y-4">
                    <SidebarLink icon={<LayoutDashboardIcon />} label="All Docs" active />
                    <SidebarLink icon={<SettingsIcon />} label="Settings" />
                </nav>

                <div className="p-6 border-t-4 border-black bg-black text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-[#FF4D4D] border-2 border-white flex items-center justify-center font-black text-xl">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                            <p className="font-black truncate">@{user?.username}</p>
                            <p className="text-xs font-bold text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-white hover:bg-white hover:text-black transition-colors font-black uppercase text-sm"
                    >
                        <LogOutIcon size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12">
                <div className="max-w-6xl mx-auto">
                    <header className="flex justify-between items-end mb-16">
                        <div>
                            <h2 className="text-6xl font-black uppercase tracking-tighter mb-2">My Workshop</h2>
                            <p className="text-xl font-bold text-gray-500">You have {documents.length} documents in total.</p>
                        </div>
                        <button 
                            onClick={createDoc}
                            className="bg-[#4D7CFE] text-white px-10 py-5 text-2xl font-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center gap-3"
                        >
                            <PlusIcon size={32} strokeWidth={4} /> NEW DOCUMENT
                        </button>
                    </header>

                    {/* Search Bar */}
                    <div className="mb-12 relative">
                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-black w-8 h-8" />
                        <input 
                            type="text"
                            placeholder="SEARCH YOUR DOCUMENTS..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full p-6 pl-18 bg-white border-4 border-black text-2xl font-black placeholder:text-gray-300 focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                        />
                    </div>

                    {/* Documents Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredDocs.map((doc) => (
                            <Link key={doc._id} href={`/documents/${doc._id}`}>
                                <div className="group bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col h-80 overflow-hidden">
                                    <div className="h-32 bg-[#F1F1F1] border-b-4 border-black p-6 flex items-center justify-center group-hover:bg-[#FFD700] transition-colors">
                                        <FileTextIcon size={48} />
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-2xl font-black mb-1 truncate uppercase">{doc.title}</h3>
                                            <p className="text-sm font-bold text-gray-400">MODIFIED {new Date(doc.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black bg-black text-white px-2 py-1 uppercase tracking-widest">ID: {doc._id.slice(-6)}</span>
                                            <button 
                                                onClick={(e) => deleteDoc(doc._id, e)}
                                                className="p-2 border-2 border-black hover:bg-[#FF4D4D] transition-colors"
                                            >
                                                <Trash2Icon size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        
                        {filteredDocs.length === 0 && (
                            <div className="col-span-full py-32 text-center border-8 border-dashed border-black">
                                <p className="text-4xl font-black text-gray-300 uppercase italic">Nothing found in the archives</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={`flex items-center gap-4 p-4 border-4 border-black font-black uppercase text-lg cursor-pointer transition-all ${active ? 'bg-[#FF4D4D] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-[#F1F1F1] hover:translate-x-1 hover:translate-y-1'}`}>
            {icon}
            {label}
        </div>
    );
}
