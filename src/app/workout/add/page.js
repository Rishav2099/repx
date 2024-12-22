'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const WorkoutPage = () => {
    const router = useRouter()
    const [workouts, setWorkouts] = useState([]);
    const [workoutName, setWorkoutName] = useState('')

    useEffect(() => {
        // Load exercises from localStorage
        const exercises = JSON.parse(localStorage.getItem('selectedExercises')) || [];
        setWorkouts(
            exercises.map((exercise) => ({
                exercise: exercise._id, // Assuming _id represents the ObjectId for the exercise
                name: exercise.name, // Display name for frontend use
                type: '', // Type of input (either 'reps' or 'time')
                duration: '', // Value for reps or time
            }))
        );
    }, []);

    const handleTypeChange = (index, type) => {
        const updatedWorkouts = [...workouts];
        updatedWorkouts[index].type = type; // Update type to 'reps' or 'time'
        updatedWorkouts[index].duration = ''; // Clear the duration value when type changes
        setWorkouts(updatedWorkouts);
    };

    const handleValueChange = (index, value) => {
        const updatedWorkouts = [...workouts];
        updatedWorkouts[index].duration = value; // Update value for the selected type
        setWorkouts(updatedWorkouts);
    };

    const handleDeleteExercise = (index) => {
        const updatedWorkouts = workouts.filter((_, i) => i !== index); // Remove the selected workout
        setWorkouts(updatedWorkouts);
        localStorage.setItem('selectedExercises', JSON.stringify(updatedWorkouts));
    };

    const handleSave = async () => {
        try {
            // Validate workouts to ensure type and duration are provided
            const validWorkouts = workouts
                .filter((workout) => workout.type && workout.duration)
                .map((workout) => ({
                    exercise: workout.exercise,
                    duration: workout.type === 'time'
                        ? { time: parseInt(workout.duration, 10) }
                        : { reps: parseInt(workout.duration, 10) },
                }));

            if (validWorkouts.length === 0) {
                alert('Please select reps or time and provide values for at least one workout.');
                return;
            }

            // Save workouts to the backend
            const response = await fetch('/api/workout/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workouts: validWorkouts, name: workoutName }),
            });

            const result = await response.json();
            if (result.success) {
                localStorage.removeItem('selectedExercises')
               router.push('/')
            } else {
                alert('Failed to save workouts.');
            }
        } catch (error) {
            console.error('Error saving workouts:', error);
        }
    };


    return (
        <div className="p-5 bg-gray-900 min-h-screen text-gray-100">
            <h2 className="text-3xl font-bold mb-5 text-center text-blue-400">Workout</h2>
            <div className="name">
                <input className='mb-5 text-black rounded-lg py-2 pl-5' placeholder='Workout Name' type="text" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} />
            </div>
            <div className="btn bg-blue-600 w-fit px-5 py-2 rounded-lg mb-5">
                <Link href={'/exercise'}>
                    <button className="text-white font-medium">Add Exercise</button>
                </Link>
            </div>
            <ul className="space-y-5">
                {workouts.map((workout, index) => (
                    <li
                        key={workout.exercise}
                        className="bg-gray-800 shadow-md p-4 rounded-md hover:shadow-lg transition duration-200 flex justify-between items-center"
                    >
                        <div>
                            <h3 className="text-xl font-semibold text-gray-100">{workout.name}</h3>
                            <div className="mt-2 flex flex-col space-y-2">
                                {/* Dropdown for selecting reps or time */}
                                <select
                                    className="border border-gray-600 bg-gray-700 text-gray-100 px-2 py-1 rounded-md"
                                    value={workout.type}
                                    onChange={(e) => handleTypeChange(index, e.target.value)}
                                >
                                    <option value="">Select Type</option> {/* Placeholder option */}
                                    <option value="reps">Reps</option>
                                    <option value="time">Time (secs)</option>
                                </select>

                                {/* Input field for reps or time */}
                                {workout.type && (
                                    <input
                                        type="number"
                                        className="border border-gray-600 bg-gray-700 text-gray-100 px-2 py-1 rounded-md"
                                        placeholder={workout.type === 'reps' ? 'Enter Reps' : 'Enter Time (secs)'}
                                        value={workout.duration}
                                        onChange={(e) => handleValueChange(index, e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                        {/* Delete Icon */}
                        <button
                            className="text-red-500 hover:text-red-700 transition duration-200"
                            onClick={() => handleDeleteExercise(index)}
                        >
                            <FaTrash size={20} />
                        </button>
                    </li>
                ))}
            </ul>
            <button
                className="bg-blue-500 text-gray-100 py-2 px-4 rounded-md mt-5 block mx-auto hover:bg-blue-600"
                onClick={handleSave}
            >
                Save Workouts
            </button>
        </div>
    );
};

export default WorkoutPage;
