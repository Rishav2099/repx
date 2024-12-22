'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };
  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6">
      <div className="text-center max-w-xl">
        <h1 className="text-5xl font-bold mb-6">Welcome to <span className="text-yellow-300">Repx</span></h1>
        <p className="text-lg mb-8">
          Your ultimate fitness tracker app, designed to help you achieve your goals, monitor your progress, and stay motivated every day.
        </p>
      </div>
      <div className="flex gap-5">
        <button
          className="px-6 py-3 bg-yellow-300 text-black rounded-lg font-semibold hover:bg-yellow-400 transition duration-300"
          onClick={handleSignup}
        >
          Sign Up
        </button>
        <button
          className="px-6 py-3 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-black transition duration-300"
          onClick={handleLogin}
        >
          Log In
        </button>
      </div>
      <div className="mt-12 text-sm text-gray-200">
        <p>© 2024 Repx. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Home;
