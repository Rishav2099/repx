'use client';
import React, { useContext, useState } from 'react';
import { ExercisesContext } from './layout';
import { useRouter } from 'next/navigation';

const ExercisePage = () => {
    const { exercises } = useContext(ExercisesContext); // Access exercises from context
    const [selectedExercises, setSelectedExercises] = useState([]);
    const router = useRouter();

    const toggleExerciseSelection = (exercise) => {
        if (selectedExercises.includes(exercise)) {
            setSelectedExercises(selectedExercises.filter((e) => e !== exercise));
        } else {
            setSelectedExercises([...selectedExercises, exercise]);
        }
    };

    const handleNext = () => {
        if (selectedExercises.length > 0) {
            // Save selected exercises to localStorage or pass them as query params/state
            localStorage.setItem('selectedExercises', JSON.stringify(selectedExercises));
            router.push('/workout/add'); // Navigate to the workout page
        } else {
            alert('Please select at least one exercise.');
        }
    };

    return (
        <div className="p-5 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold mb-5 text-center text-blue-600">Exercises</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {exercises.map((exercise) => (
                    <li
                        key={exercise._id}
                        className={`bg-white shadow-md p-4 rounded-md hover:shadow-lg transition duration-200 ${selectedExercises.includes(exercise) ? 'border-2 border-blue-600' : ''
                            }`}
                        onClick={() => toggleExerciseSelection(exercise)}
                    >
                        <img
                            className="w-full h-40 object-cover"
                            src={exercise.gif || '/placeholder.png'}
                            alt={exercise.name}
                        />
                        <h3 className="text-xl font-semibold text-gray-800">{exercise.name}</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Targets: {exercise.muscleTargeted?.join(', ') || 'Unknown'}
                        </p>
                    </li>
                ))}
            </ul>
            <button
                className="bg-blue-600 text-white py-2 px-4 rounded-md mt-5 block mx-auto"
                onClick={handleNext}
            >
                Next
            </button>
        </div>
    );
};

export default ExercisePage;
