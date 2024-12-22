'use client';
import { useEffect, useState } from "react";
import Home from "./components/Home";
import axios from "axios";
import Spinner from './components/Spinner';
import AddButton from "./components/AddButton";
import Link from "next/link";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, SetshowPopup] = useState(false);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/me');

      const userData = response.data?.user;
      if (userData) {
        console.log('User Data:', userData);
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error.message);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get('/api/workout');
      console.log(response.message);

      const workoutsData = response.data?.workouts || [];

      if (workoutsData.length === 0) {
        console.log('No workouts were found.');
      } else {
        console.log('Workouts fetched:', workoutsData);
      }

      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Error fetching workouts:', error.message);
      setWorkouts([]);
    }
  };

  const deleteWorkout = async (id) => {
    const res = await axios.delete(`/api/workout/${id}`)
    if (res) {
      fetchWorkouts()
      alert('deleted')
    }
  }
  

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWorkouts();
    }
  }, [isLoggedIn]);

  if (loading) return <Spinner />;

  if (!isLoggedIn) return <Home />;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-5">
      <h1 className="text-3xl font-bold text-center mb-5 text-blue-400">
        Welcome, {user?.name || 'User'}💪🏼
      </h1>
      <div className="workouts mb-8 w-full">
        <h2 className="text-2xl font-semibold text-center mb-5">Your Workouts</h2>
        <div className="flex justify-center w-full items-center">
          {workouts.length === 0 ? (
            <div className="text-gray-400">No workouts created. Start your fitness journey!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
              {workouts.map((workout) => (
                <div className="bg-gray-800 w-full sm:w-auto flex justify-between items-center p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200" key={workout._id}>
                <Link href={`/workout/start/${workout._id}`} >
                  <div className="cursor-pointer" >
                    <p className=" text-xl font-medium">{workout.name}</p>
                  </div>
                </Link>
                    <button onClick={() => deleteWorkout(workout._id)} className="hover:bg-slate-900 px-5 py-2 rounded-full">
                      <BsThreeDotsVertical />
                    </button>
                    </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="relative">
        <AddButton onClick={() => SetshowPopup((prev) => !prev)} />

        {showPopup && (
          <Link href="/workout/add">
            <div
              className="fixed bottom-16 right-5 w-48 bg-blue-600 text-white py-3 px-4 rounded-lg shadow-lg transition-all duration-300 hover:bg-blue-500"
            >
              <span className="text-lg block text-center">Add New Exercise</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
