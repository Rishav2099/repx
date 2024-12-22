'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'

const Page = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter()

    const submit = async (e) => {
        e.preventDefault();
    
        try {
            const raw = JSON.stringify({ name, password });
    
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: raw,
            };
    
            const res = await fetch("http://localhost:3000/api/signup", requestOptions);
            const data = await res.json();
    
            if (!res.ok) {
                setError(data.message);
    
                // Check if redirection is required
                if (data.redirectTo) {
                    router.push(data.redirectTo);
                }
    
                return;
            }
    
            console.log("Success:", data);
            router.push("/");
        } catch (err) {
            console.error("Request failed:", err);
            setError("An error occurred while submitting the form.");
        }
    };
    

    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            <div className="bg-black shadow-md rounded-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-white">Sign Up</h1>
                <form
                    className="text-black caret-blue-500 flex flex-col gap-6 bg-slate-900 p-10 border rounded-2xl"
                    onSubmit={submit} // Call the submit function on form submission
                >
                    {/* Name Input */}
                    <div className="relative">
                        <label
                            htmlFor="name"
                            className="absolute text-sm text-gray-500 transform -translate-y-3 scale-75 top-3 left-3 origin-[0] peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:translate-y-1 peer-focus:scale-75 transition-all"
                        >
                            Enter your Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
                            placeholder=" "
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <label
                            htmlFor="password"
                            className="absolute text-sm text-gray-500 transform -translate-y-3 scale-75 top-3 left-3 origin-[0] peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:translate-y-1 peer-focus:scale-75 transition-all"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent peer"
                            placeholder=" "
                            required
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-white rounded-full py-3 button"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Page;
