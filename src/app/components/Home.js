'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

const Home = () => {
    const router = useRouter()

    const handleLogin = () => {
      router.push('/login')
    }
    const handleSignup = () => {
      router.push('/signup')
    }
    
  return (
    <div className=' flex flex-col h-screen justify-center items-center gap-5 w-full'>
      we are repx and you are not logged in
      <div className="btn flex gap-5">
      <button className='bg-white text-black px-5 py-2 ' onClick={handleSignup}>Sign-Up</button>
      <button className='bg-white text-black px-5 py-2 ' onClick={handleLogin}>Log-in</button>

      </div>
    </div>
  )
}

export default Home
