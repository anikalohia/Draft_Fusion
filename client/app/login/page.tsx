'use client'
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                login(data.user, data.token);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] font-sans">
            <div className="bg-[#4D7CFE] p-10 border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
                <h1 className="text-4xl font-black mb-6 text-white uppercase tracking-tighter">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xl font-bold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 border-4 border-black bg-white focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        />
                    </div>
                    <div>
                        <label className="block text-xl font-bold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 border-4 border-black bg-white focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        />
                    </div>
                    {error && <p className="text-red-600 bg-white p-2 border-2 border-black font-bold">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-[#FFD700] p-4 text-2xl font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                        GO!
                    </button>
                </form>
                <p className="mt-6 font-bold">
                    New here? <Link href="/signup" className="underline hover:text-white">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
