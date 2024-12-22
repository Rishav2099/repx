'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function WorkoutStart() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [workout, setWorkout] = useState(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [exerciseDetail, setExerciseDetail] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // Pause state

  // Helper function to format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        const response = await axios.get(`/api/workout/${id}`);
        const fetchedWorkout = response.data.workout;
        console.log('fetchedworkout', fetchedWorkout);
        

        setWorkout(fetchedWorkout);

        const firstExercise = fetchedWorkout.exercises[0]?.duration || {};
        setExerciseDetail(firstExercise);
        if (firstExercise.time) {
          setTimeLeft(firstExercise.time);
        }
      } catch (error) {
        console.error('Error fetching workout details:', error.message);
      }
    };

    if (id) fetchWorkoutDetails();
  }, [id]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !isPaused) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, isPaused]);

  useEffect(() => {
    let timer;
    if (!isPaused) {
      timer = setInterval(() => {
        setTotalTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused]);

  const pauseResumeWorkout = () => {
    setIsPaused((prev) => !prev); // Toggle pause state
  };

  const handleNextExercise = () => {
    if (exerciseIndex + 1 < workout.exercises.length) {
      setExerciseIndex((prev) => prev + 1);
      const nextExercise = workout.exercises[exerciseIndex + 1]?.duration || {};
      setExerciseDetail(nextExercise);
      if (nextExercise.time) {
        setTimeLeft(nextExercise.time);
      } else {
        setTimeLeft(0);
      }
    } else {
      alert(`Workout Complete! Total Time: ${formatTime(totalTime)}`);
      router.push('/'); // Redirect back to the home page
    }
  };

  const handlePreviousExercise = () => {
    if (exerciseIndex - 1 >= 0) {
      setExerciseIndex((prev) => prev - 1);
      const previousExercise = workout.exercises[exerciseIndex - 1]?.duration || {};
      setExerciseDetail(previousExercise);
      if (previousExercise.time) {
        setTimeLeft(previousExercise.time);
      } else {
        setTimeLeft(0);
      }
    }
  };

  const exitWorkout = () => {
    router.push('/');
  };

  const completeWorkout = async () => {
    try {
      const log = {
        workoutName: workout.name,
        exercises: workout.exercises.map((exercise) => ({
          exerciseName: exercise.exercise.name,
          duration: exercise.duration,
        })),
        totalTime,
      };
      await axios.post('/api/workout/log', log); // Save workout log to the server
      alert('Workout saved successfully!');
      router.push('/'); // Redirect to a summary page
    } catch (error) {
      console.error('Error saving workout log:', error.message);
      alert('Failed to save workout. Please try again.');
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-5 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-5 text-blue-400">
        {workout?.name || 'Loading Workout...'}
      </h1>

      {workout ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Current Exercise: {workout.exercises[exerciseIndex]?.exercise?.name || 'Done!'}
          </h2>
          <p className="text-lg mb-4">
            {exerciseDetail.reps !== undefined ? (
              <>
                Reps Remaining: <span className="text-blue-400">{exerciseDetail.reps}</span>
              </>
            ) : exerciseDetail.time !== undefined ? (
              <>
                Time Remaining: <span className="text-blue-400">{formatTime(timeLeft)}</span>
              </>
            ) : (
              'No details available'
            )}
          </p>
          <p className="text-lg">
            Total Time Taken: <span className="text-green-400">{formatTime(totalTime)}</span>
          </p>

          <div className="flex gap-4 justify-center mt-4">
            <button
              className={`px-5 py-2 rounded-lg ${
                exerciseIndex === 0 ? 'bg-green-300' : 'bg-green-500'
              }`}
              onClick={handlePreviousExercise}
            >
              Previous Exercise
            </button>
            <button
              className="px-5 py-2 bg-red-500 rounded-md hover:bg-red-400"
              onClick={pauseResumeWorkout}
            >
              {isPaused ? 'Resume Workout' : 'Pause Workout'}
            </button>
            <button
              className="px-5 py-2 bg-yellow-500 rounded-md hover:bg-yellow-400"
              onClick={handleNextExercise}
              disabled={isPaused} // Disable the button when paused
            >
              Next Exercise
            </button>
          </div>
          <button
            className="mt-4 px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-400"
            onClick={completeWorkout}
          >
            Done
          </button>
          <button
            onClick={exitWorkout}
            className="fixed bottom-2 left-2 bg-red-700 px-5 py-2 rounded-lg"
          >
            Exit
          </button>
        </div>
      ) : (
        <p>Loading workout details...</p>
      )}
    </div>
  );
}
