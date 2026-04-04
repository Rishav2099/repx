"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, List, Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
  const [currentSet, setCurrentSet] = useState(1);

  const [exerciseBreak, setExerciseBreak] = useState(false);
  const [breakDuration, setBreakDuration] = useState(0);
  const [showBreakDropdown, setShowBreakDropdown] = useState(false);

  // NEW: State for the End Workout Dialog
  const [showEndDialog, setShowEndDialog] = useState(false);

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

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isPaused) {
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isPaused]);

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

  const handleExerciseComplete = () => {
    if (!workout) return;
    const currentExercise = workout.exercises[currentIndex];
    const totalSets = currentExercise.sets || 1;

    if (currentSet < totalSets) {
      setCurrentSet(prev => prev + 1);
      startBreak();
    } else {
      const updatedExercises = doneWorkout ? [...doneWorkout.exercises, currentExercise] : [currentExercise];
      setDoneWorkout({ workoutName: workout.workoutName, exercises: updatedExercises });

      if (currentIndex < workout.exercises.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setCurrentSet(1); 
        startBreak();
      } else {
        storeWorkout(updatedExercises);
      }
    }
  };

  // NEW: Early End Handler
  const handleEndWorkoutEarly = () => {
    setShowEndDialog(false);
    const exercisesToSave = doneWorkout ? doneWorkout.exercises : [];
    
    if (exercisesToSave.length === 0) {
      router.push("/track"); 
    } else {
      storeWorkout(exercisesToSave);
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
      setCurrentSet(1); 
    }
  };

  if (loading || !workout) {
    return <div className="flex justify-center items-center h-screen"><Loader /></div>;
  }

  const currentExercise = workout.exercises[currentIndex];

  return (
    <div className="flex flex-col min-h-dvh max-h-dvh relative bg-background text-foreground overflow-hidden">
      
      {/* 1. Header */}
      <WorkoutHeader 
        workoutName={workout.workoutName}
        isPaused={isPaused}
        togglePause={() => setIsPaused(!isPaused)}
        formattedDuration={formatTime(duration)}
      />

      {/* 2. Main Display */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto">
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
        <div className="flex justify-center gap-4 py-6 mt-4">
          <Button
            onClick={() => navigateExercise(-1)}
            variant="outline"
            disabled={isPaused || exerciseBreak || currentIndex === 0}
            className="w-16 h-14 rounded-2xl"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <Button
            onClick={handleExerciseComplete}
            variant="primary"
            disabled={isPaused || exerciseBreak}
            className="w-40 h-14 font-black text-xl rounded-2xl shadow-lg shadow-red-500/20"
          >
            DONE
          </Button>
          <Button
            onClick={() => navigateExercise(1)}
            variant="outline"
            disabled={isPaused || exerciseBreak || workout.exercises.length - 1 === currentIndex}
            className="w-16 h-14 rounded-2xl"
          >
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* 3. Bottom App Bar (View Exercises & End Workout) */}
      <div className="border-t bg-card/50 backdrop-blur-md px-4 py-4 pb-safe flex gap-3 z-40">
        
        {/* Drawer Component Restored */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="secondary" className="flex-1 h-12 rounded-xl font-bold">
              <List className="w-4 h-4 mr-2" />
              View Plan
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle>Workout Plan</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto space-y-3">
              {workout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    index === currentIndex 
                      ? "border-red-500 bg-red-500/5 shadow-sm" 
                      : "border-border hover:bg-accent"
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setCurrentSet(1);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg capitalize">
                      {exercise.name}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                      {exercise.reps
                        ? `${exercise.sets} × ${exercise.reps}`
                        : formatTime(exercise.time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DrawerContent>
        </Drawer>

        {/* End Workout Trigger */}
        <Button 
          variant="destructive" 
          className="flex-1 h-12 rounded-xl font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
          onClick={() => setShowEndDialog(true)}
        >
          <Flag className="w-4 h-4 mr-2" />
          Finish Early
        </Button>
      </div>

      {/* 4. Break Overlay */}
      <BreakOverlay 
        exerciseBreak={exerciseBreak}
        showBreakDropdown={showBreakDropdown}
        setShowBreakDropdown={setShowBreakDropdown}
        breakDuration={breakDuration}
        setBreakDuration={setBreakDuration}
        skipBreak={endBreak}
      />

      {/* 5. Custom End Workout Confirmation Dialog */}
      {showEndDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-card border shadow-2xl rounded-3xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-red-500/10 p-3 rounded-full text-red-500">
                <Flag className="w-6 h-6" />
              </div>
              <button onClick={() => setShowEndDialog(false)} className="text-muted-foreground p-1 hover:bg-accent rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-black text-2xl mb-2">Finish Workout?</h3>
            <p className="text-muted-foreground font-medium mb-6 leading-relaxed">
              Are you sure you want to end your workout early? Only the exercises you have marked as Done will be saved to your history.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setShowEndDialog(false)}>
                Resume
              </Button>
              <Button variant="default" className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white" onClick={handleEndWorkoutEarly}>
                Yes, Finish
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Page;