"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Loader2, Play, Pause, ArrowLeft, ArrowRight } from "lucide-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Exercise {
  name: string;
  reps: number;
  sets: number;
  time: number;
}

interface Workout {
  _id?: string;
  workoutName: string;
  exercises: Exercise[];
}

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);

  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [exerciseTime, setExerciseTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [exerciseBreak, setExerciseBreak] = useState(false);
  const [breakDuration, setBreakDuration] = useState(0);
  const [showBreakDropdown, setShowBreakDropdown] = useState(false);
  const [doneWorkout, setDoneWorkout] = useState<Workout | null>(null);

  const [editingField, setEditingField] = useState<"reps" | "sets" | null>(
    null
  );

  const router = useRouter();

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/workout/${id}`);
      if (res.status === 200) setWorkout(res.data.workout);
    } catch (error) {
      console.error("Error fetching workout:", error);
    } finally {
      setLoading(false);
    }
  };

  // Workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isPaused && !exerciseBreak) {
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, exerciseBreak]);

  // Break timer
  useEffect(() => {
    let breakInterval: NodeJS.Timeout | null = null;
    let beepPlayed = false;
    if (exerciseBreak) {
      breakInterval = setInterval(() => {
        setBreakDuration((prev) => {
          if (prev <= 1) {
            clearInterval(breakInterval!);
            setExerciseBreak(false);
            setShowBreakDropdown(false);
            return 0;
          }

          // play sound in last 3 seconds
          if(prev <= 5 && !beepPlayed){
            const beep = new Audio('/sounds/beep.mp3');
            beep.play()
            beepPlayed = true
          }
         
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (breakInterval) clearInterval(breakInterval);
    };
  }, [exerciseBreak]);

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  useEffect(() => {
    if (workout && workout.exercises[currentIndex]?.time) {
      setExerciseTime(workout.exercises[currentIndex].time);
    } else {
      setExerciseTime(0);
    }
  }, [currentIndex, workout]);

  useEffect(() => {
    if (exerciseTime <= 0 || isPaused || exerciseBreak) return;

    const timer = setInterval(() => {
      setExerciseTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          doneExercise();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exerciseTime, isPaused, exerciseBreak]);

  if (loading || !workout) {
    return (
      <div className="flex items-center justify-center gap-2 h-full w-full">
        Loading <Loader2 className="animate-spin" />
      </div>
    );
  }

  const currentExercise = workout.exercises[currentIndex];

  const updateExerciseField = (field: "reps" | "sets", value: number) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises[currentIndex] = {
      ...updatedExercises[currentIndex],
      [field]: value,
    };
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  const nextExercise = () => {
    if (currentIndex < workout.exercises.length - 1)
      setCurrentIndex((prev) => prev + 1);
  };

  const storeWorkout = async () => {
    try {
      const res = await axios.post(`/api/workout/store`, {
        doneWorkout,
        duration,
      });
      console.log(res);
      if (res.status === 201) {
        router.push(`/workout/done/${res.data.storedWorkout._id}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const doneExercise = () => {
    if (!currentExercise) return;

    setDoneWorkout((prev) => {
      if (!prev) {
        return {
          workoutName: workout.workoutName,
          exercises: [currentExercise],
        };
      }
      return {
        ...prev,
        exercises: [...prev.exercises, currentExercise],
      };
    });

    setBreakDuration(60);
    setShowBreakDropdown(true);

    setExerciseBreak(true);
    if (currentExercise.sets > 1) {
      const updatedExercises = [...workout.exercises];
      updatedExercises[currentIndex] = {
        ...currentExercise,
        sets: currentExercise.sets - 1,
      };
      setWorkout({ ...workout, exercises: updatedExercises });
    } else {
      nextExercise();
      if (currentIndex === workout.exercises.length - 1) {
        setBreakDuration(0);
        storeWorkout();
        setShowBreakDropdown(false);
      }
    }
  };

  const prevExercise = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
    else alert("No previous exercise");
  };

  const togglePause = () => setIsPaused((prev) => !prev);

  const formatTime = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="flex flex-col min-h-dvh max-h-dvh relative">
      <Drawer>
        {/* Workout Header */}
        <header className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-2xl">
              {workout.workoutName.charAt(0).toUpperCase() +
                workout.workoutName.slice(1)}
            </h1>
            <Button
              onClick={togglePause}
              variant="primary"
              size="icon"
              className="w-10 h-10 transition transform hover:scale-110 active:scale-95"
            >
              {isPaused ? <Play /> : <Pause />}
            </Button>
          </div>
          <div className="text-center">
            <span className="block">{formatTime(duration)}</span>
            <span className="text-sm text-slate-500">Duration</span>
          </div>
        </header>

        {/* Exercise Display */}
        <main className="flex flex-col flex-1 items-center justify-center ">
          <div
            className="rounded-full border-8 animate-flicker transition-transform duration-300 ease-in-out border-red-500 flex flex-col gap-8 items-center justify-center"
            style={{
              width: "clamp(250px, 95vw, 500px)",
              height: "clamp(250px, 95vw, 500px)",
            }}
          >
            <div className="flex flex-col items-center mt-5">
              <h2 className="font-bold text-2xl max-w-[90%] break-words text-center">
                {currentExercise.name.charAt(0).toUpperCase() +
                  currentExercise.name.slice(1)}
              </h2>

              <p className="text-lg font-semibold text-slate-400">
                {currentExercise.sets ? currentExercise.sets : 1} Sets Left
              </p>
            </div>

            {currentExercise.reps ? (
              <div className="flex flex-col items-center">
                {/* Reps */}
                {editingField === "reps" ? (
                  <input
                    type="number"
                    min={1}
                    value={currentExercise.reps}
                    className="bg-[#b13d404d] border-2 text-2xl font-bold text-white shadow-red-600 border-red-600 py-2 px-6 rounded-full w-24 text-center"
                    onChange={(e) =>
                      updateExerciseField("reps", parseInt(e.target.value) || 1)
                    }
                    onBlur={() => setEditingField(null)}
                    autoFocus
                  />
                ) : (
                  <p
                    className="bg-[#b13d404d] border-2 text-2xl font-bold text-white shadow-red-600 border-red-600 py-2 px-6 rounded-full w-24 text-center cursor-pointer"
                    onClick={() => setEditingField("reps")}
                  >
                    {currentExercise.reps}
                  </p>
                )}
                <p className="font-bold text-lg mt-2">Reps</p>

                {/* Sets */}
                {editingField === "sets" ? (
                  <input
                    type="number"
                    min={1}
                    value={currentExercise.sets}
                    className="bg-[#b13d404d] border-2 text-xl font-bold text-white shadow-red-600 border-red-600 py-2 px-6 rounded-full w-24 text-center mt-3"
                    onChange={(e) =>
                      updateExerciseField("sets", parseInt(e.target.value) || 1)
                    }
                    onBlur={() => setEditingField(null)}
                    autoFocus
                  />
                ) : (
                  <p
                    className="bg-[#b13d404d] border-2 text-xl font-bold text-white shadow-red-600 border-red-600 py-2 px-6 rounded-full w-24 text-center cursor-pointer mt-3"
                    onClick={() => setEditingField("sets")}
                  >
                    {currentExercise.sets}
                  </p>
                )}
                <p className="font-bold text-lg mt-1">Sets</p>
              </div>
            ) : (
              <div>
                <p className="bg-[#b13d404d] border-2 text-3xl font-bold text-white shadow-red-600 border-red-600 py-2 px-6 rounded-full text-center">
                  {formatTime(exerciseTime)}
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-3 py-4">
          <Button
            onClick={prevExercise}
            variant="primary"
            disabled={isPaused || exerciseBreak || currentIndex === 0}
          >
            <ArrowLeft />
          </Button>
          <Button
            onClick={doneExercise}
            variant="primary"
            disabled={isPaused || exerciseBreak}
          >
            Done
          </Button>
          <Button
            onClick={nextExercise}
            variant="primary"
            disabled={
              isPaused ||
              exerciseBreak ||
              workout.exercises.length - 1 === currentIndex
            }
          >
            <ArrowRight />
          </Button>
        </div>

        {/* Drawer Trigger */}
        <div className="flex justify-center pb-4">
          <DrawerTrigger asChild>
            <Button variant="secondary">View Exercises</Button>
          </DrawerTrigger>
        </div>

        {/* Drawer Content */}
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>All Exercises</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-3">
            {workout.exercises.map((exercise, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  index === currentIndex ? "border-red-700" : "border-slate-300"
                } hover:shadow-md`}
                onClick={() => setCurrentIndex(index)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {exercise.name.charAt(0).toUpperCase() +
                      exercise.name.slice(1)}
                  </span>
                  <span className="text-sm">
                    {exercise.reps
                      ? `${exercise.sets} sets × ${exercise.reps} reps`
                      : formatTime(exercise.time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Break dropdown */}
      {exerciseBreak && (
        <div className="fixed top-20 right-5 z-50">
          {!showBreakDropdown && (
            <Button
              className="px-3 py-1 rounded-lg shadow-md transition"
              onClick={() => setShowBreakDropdown(true)}
            >
              Break: {breakDuration}s
            </Button>
          )}

          <div
            className={`border dark:bg-[#262626] bg-white shadow-lg p-4 rounded-md w-60 transform transition-all duration-300 ease-in-out
              ${
                showBreakDropdown
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0 pointer-events-none"
              }`}
          >
            <h3 className="font-bold text-lg mb-2">Break Timer</h3>
            <p className="text-xl text-center mb-4">{breakDuration}s left</p>

            <div className="flex justify-between mb-2">
              <Button
                size="sm"
                onClick={() => setBreakDuration((prev) => prev + 15)}
              >
                +15s
              </Button>
              <Button
                size="sm"
                onClick={() => setBreakDuration((prev) => prev + 30)}
              >
                +30s
              </Button>
              <Button
                size="sm"
                onClick={() => setBreakDuration((prev) => prev + 60)}
              >
                +1min
              </Button>
            </div>

            <div className="flex justify-center mt-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setExerciseBreak(false);
                  setShowBreakDropdown(false);
                }}
                className="cursor-pointer"
              >
                Skip Break
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowBreakDropdown(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
