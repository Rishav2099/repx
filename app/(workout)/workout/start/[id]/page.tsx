"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { Workout, Exercise } from "@/types/workout";

import { WorkoutHeader } from "@/components/workout/WorkoutHeader";
import { ExerciseDisplay } from "@/components/workout/ExerciseDisplay";
import { BreakOverlay } from "@/components/workout/BreakOverlay";

const formatTime = (sec: number) => {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  const router = useRouter();
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  
  const [exerciseTime, setExerciseTime] = useState<number>(0);
  const [editingField, setEditingField] = useState<"reps" | "sets" | null>(null);
  
  const [doneWorkout, setDoneWorkout] = useState<Workout | null>(null);
  
  // NEW: Track the current set without mutating the database object
  const [currentSet, setCurrentSet] = useState(1);

  const [exerciseBreak, setExerciseBreak] = useState(false);
  const [breakDuration, setBreakDuration] = useState(0);
  const [showBreakDropdown, setShowBreakDropdown] = useState(false);

  useEffect(() => {
    beepAudioRef.current = new Audio("/sounds/beep.mp3");
    fetchWorkout();
  }, [id]);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/workout/${id}`);
      if (res.status === 200) setWorkout(res.data.workout);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // FIX 1: Main Workout Timer now ONLY pauses on 'isPaused', allowing it to count during breaks
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isPaused) {
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isPaused]);

  // Break Timer
  useEffect(() => {
    let breakInterval: NodeJS.Timeout | null = null;
    let beepPlayed = false;

    if (exerciseBreak) {
      breakInterval = setInterval(() => {
        setBreakDuration((prev) => {
          if (prev <= 1) {
            clearInterval(breakInterval!);
            endBreak();
            return 0;
          }
          if (prev <= 5 && !beepPlayed && beepAudioRef.current) {
            beepAudioRef.current.play().catch(e => console.log(e));
            beepPlayed = true;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (breakInterval) clearInterval(breakInterval); };
  }, [exerciseBreak]);

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
          handleExerciseComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exerciseTime, isPaused, exerciseBreak]);

  const endBreak = () => {
    setExerciseBreak(false);
    setShowBreakDropdown(false);
  };

  const updateExerciseField = (field: "reps" | "sets", value: number) => {
    if (!workout) return;
    const updatedExercises = [...workout.exercises];
    updatedExercises[currentIndex] = { ...updatedExercises[currentIndex], [field]: value };
    setWorkout({ ...workout, exercises: updatedExercises });
  };

  // Helper to store workout securely
  const storeWorkout = async (finalExercises: Exercise[]) => {
    try {
      const payload = { workoutName: workout?.workoutName, exercises: finalExercises };
      const res = await axios.post(`/api/workout/store`, { doneWorkout: payload, duration });
      if (res.status === 201) {
        router.push(`/workout/done/${res.data.storedWorkout._id}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // FIX 2: Correctly consolidate saving logic
  const handleExerciseComplete = () => {
    if (!workout) return;
    const currentExercise = workout.exercises[currentIndex];
    const totalSets = currentExercise.sets || 1;

    if (currentSet < totalSets) {
      // Finished a set, but more sets remain. Increment set counter & rest.
      setCurrentSet(prev => prev + 1);
      startBreak();
    } else {
      // Finished the LAST set! Log the exercise exactly ONCE.
      const updatedExercises = doneWorkout ? [...doneWorkout.exercises, currentExercise] : [currentExercise];
      setDoneWorkout({ workoutName: workout.workoutName, exercises: updatedExercises });

      if (currentIndex < workout.exercises.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setCurrentSet(1); // Reset set counter for the new exercise
        startBreak();
      } else {
        // Workout Finished -> Pass the compiled array directly to avoid state race conditions
        storeWorkout(updatedExercises);
      }
    }
  };

  const startBreak = () => {
    setBreakDuration(60);
    setExerciseBreak(true);
    setShowBreakDropdown(true);
  };

  const navigateExercise = (direction: 1 | -1) => {
    if (!workout) return;
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < workout.exercises.length) {
      setCurrentIndex(newIndex);
      setCurrentSet(1); // Always reset set counter when manually skipping
    }
  };

  if (loading || !workout) {
    return <div className="flex justify-center items-center h-screen"><Loader /></div>;
  }

  const currentExercise = workout.exercises[currentIndex];

  return (
    <div className="flex flex-col min-h-dvh max-h-dvh relative bg-background text-foreground">
      <WorkoutHeader 
        workoutName={workout.workoutName}
        isPaused={isPaused}
        togglePause={() => setIsPaused(!isPaused)}
        formattedDuration={formatTime(duration)}
      />

      <ExerciseDisplay 
        currentExercise={currentExercise}
        currentSet={currentSet}
        editingField={editingField}
        setEditingField={setEditingField}
        updateExerciseField={updateExerciseField}
        exerciseTime={exerciseTime}
        formatTime={formatTime}
      />

      {/* Workout Controls */}
      <div className="flex justify-center gap-4 py-6">
        <Button
          onClick={() => navigateExercise(-1)}
          variant="outline"
          disabled={isPaused || exerciseBreak || currentIndex === 0}
          className="w-16 h-12"
        >
          <ArrowLeft />
        </Button>
        <Button
          onClick={handleExerciseComplete}
          variant="primary"
          disabled={isPaused || exerciseBreak}
          className="w-32 h-12 font-bold text-lg"
        >
          Done
        </Button>
        <Button
          onClick={() => navigateExercise(1)}
          variant="outline"
          disabled={isPaused || exerciseBreak || workout.exercises.length - 1 === currentIndex}
          className="w-16 h-12"
        >
          <ArrowRight />
        </Button>
      </div>

      <BreakOverlay 
        exerciseBreak={exerciseBreak}
        showBreakDropdown={showBreakDropdown}
        setShowBreakDropdown={setShowBreakDropdown}
        breakDuration={breakDuration}
        setBreakDuration={setBreakDuration}
        skipBreak={endBreak}
      />
    </div>
  );
};

export default Page;