// src\app\_components\EnterEmail.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '../hooks/use-toast';

export default function HomePage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [exists, setExists] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setExists(null);

        try {
            const res = await fetch('/api/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (data.exists) {
                setExists(true);
                toast({
                    title: 'Success',
                    description: 'Email exists! You can proceed.',
                    variant: 'success'
                });
                setLoading(false);
                router.push(`/mainpage?email=${encodeURIComponent(email)}`);
            } else {
                setExists(false);
                setTimeout(() => {
                    router.push(`/mainpage?email=${encodeURIComponent(email)}`);
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'An error occurred. Please try again.',
                variant: 'error'
            });
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h1 className="text-xl font-semibold mb-4 text-black">Enter your email</h1>
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border p-2 rounded mb-4 text-emerald-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    {loading && exists === false ? 'Saving...' : loading ? 'Checking...' : 'Submit'}
                </button>
                {loading && exists === false && (
                    <div className="flex justify-center mt-4">
                        <svg
                            className="animate-spin h-8 w-8 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                    </div>
                )}
            </form>
        </div>
    );
}