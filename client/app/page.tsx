'use client'
import React from 'react';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { ArrowRightIcon, FileTextIcon, UsersIcon, ZapIcon, LockIcon } from 'lucide-react';

export default function LandingPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#FFD700]">
            {/* Navbar */}
            <nav className="border-b-4 border-black p-6 bg-white flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-3xl font-black uppercase tracking-tighter">Draft Fusion</h1>
                <div className="flex gap-8 items-center">
                    {user ? (
                        <Link href="/dashboard" className="text-xl font-bold underline hover:text-[#4D7CFE]">Go to Dashboard</Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-xl font-bold underline hover:text-[#4D7CFE]">Login</Link>
                            <Link href="/signup" className="bg-[#FF4D4D] text-white px-6 py-2 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">Sign Up</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header className="py-24 px-8 border-b-4 border-black bg-[#4D7CFE] relative overflow-hidden">
                <div className="absolute top-10 right-10 w-32 h-32 bg-[#FFD700] border-4 border-black rounded-full -rotate-12 flex items-center justify-center font-black text-center text-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                    100% FREE!
                </div>
                
                <div className="max-w-6xl mx-auto flex flex-col items-start gap-8">
                    <h2 className="text-7xl md:text-9xl font-black text-white leading-none uppercase tracking-tighter drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                        Real-Time <br /> Collaboration.
                    </h2>
                    <p className="text-2xl md:text-4xl font-bold text-white max-w-3xl bg-black/20 p-4 border-2 border-black">
                        The document editor for teams that love speed, simplicity, and bold design. 
                        No clutter, just creation.
                    </p>
                    <Link href={user ? "/dashboard" : "/signup"} className="group bg-[#FFD700] text-black px-12 py-6 text-3xl font-black border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center gap-4">
                        START CREATING <ArrowRightIcon className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </header>

            {/* Features Grid */}
            <section className="py-24 px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard 
                        icon={<ZapIcon className="w-12 h-12" />}
                        title="Instant Sync"
                        desc="See changes as they happen. Zero lag, 100% sync."
                        color="#FF4D4D"
                    />
                    <FeatureCard 
                        icon={<UsersIcon className="w-12 h-12" />}
                        title="Multi-User"
                        desc="Invite anyone with a link. Collaborate in seconds."
                        color="#4D7CFE"
                    />
                    <FeatureCard 
                        icon={<FileTextIcon className="w-12 h-12" />}
                        title="Rich Text"
                        desc="Tables, images, tasks. Everything you need."
                        color="#FFD700"
                    />
                    <FeatureCard 
                        icon={<LockIcon className="w-12 h-12" />}
                        title="Secure"
                        desc="Your data is yours. Encrypted and safe."
                        color="#00FF00"
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-black py-24 px-8 text-center text-white border-y-4 border-black">
                <h3 className="text-5xl md:text-7xl font-black mb-12 uppercase italic">Ready to dive in?</h3>
                <div className="flex flex-wrap justify-center gap-8">
                    <Link href="/signup" className="bg-[#FF4D4D] text-white px-10 py-5 text-2xl font-black border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
                        JOIN NOW
                    </Link>
                    <Link href="/login" className="bg-white text-black px-10 py-5 text-2xl font-black border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,77,77,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
                        LOGIN
                    </Link>
                </div>
            </section>

            <footer className="py-12 px-8 text-center font-bold border-t-4 border-black bg-white">
                <p>© 2026 DRAFT FUSION. ALL RIGHTS RESERVED. NOBRUTALISM OR DIE.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
    return (
        <div 
            className="p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform"
            style={{ borderTop: `16px solid ${color}` }}
        >
            <div className="mb-6">{icon}</div>
            <h4 className="text-2xl font-black mb-4 uppercase">{title}</h4>
            <p className="font-bold text-gray-600">{desc}</p>
        </div>
    );
}
