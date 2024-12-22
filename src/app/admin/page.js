'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

const AdminPage = () => {
  const router = useRouter()
  const [totalExercises, setTotalExercises] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)

  // useEffect(() => {
  //   // Fetch total exercises and total users from the API
  //   const fetchStats = async () => {
  //     try {
  //       const exerciseResponse = await axios.get('/api/admin/exercises/count')
  //       const userResponse = await axios.get('/api/admin/users/count')
        
  //       setTotalExercises(exerciseResponse.data.count)
  //       setTotalUsers(userResponse.data.count)
  //     } catch (error) {
  //       console.error('Error fetching data:', error)
  //     }
  //   }
  //   fetchStats()
  // }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-5">
      <div className="w-full h-[20vh] flex justify-center items-center bg-gray-800 rounded-md shadow-lg mb-6">
        <h1 className="text-4xl font-bold">Repx Admin Dashboard</h1>
      </div>

      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-semibold">Stats Overview</h2>
        </div>
        <div className="flex justify-between mb-4">
          <div className="text-center">
            <p className="text-xl font-medium">Total Exercises</p>
            <p className="text-3xl font-bold">{totalExercises}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-medium">Total Users</p>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          className="bg-blue-600 px-6 py-3 rounded-lg text-white font-bold text-lg hover:bg-blue-500 transition"
          onClick={() => router.push('/admin/addExercise')}
        >
          Add Exercise
        </button>

        {/* You can add other buttons or functionality for the admin panel here */}
        {/* <button
          className="bg-green-600 px-6 py-3 rounded-lg text-white font-bold text-lg hover:bg-green-500 transition"
          onClick={() => router.push('/admin/manageExercises')}
        >
          Manage Exercises
        </button> */}

        {/* <button
          className="bg-yellow-600 px-6 py-3 rounded-lg text-white font-bold text-lg hover:bg-yellow-500 transition"
          onClick={() => router.push('/admin/manageUsers')}
        >
          Manage Users
        </button> */}
      </div>
    </div>
  )
}

export default AdminPage
