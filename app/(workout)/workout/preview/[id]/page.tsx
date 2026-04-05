"use client";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { Play, Dumbbell, Timer, ArrowLeft, Flame } from "lucide-react";

interface Workout {
  _id: string;
  workoutName: string;
  exercises: {
    name: string;
    reps?: number;
    sets?: number;
    time?: number;
  }[];
}

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/workout/${id}`);
      if (res.status === 200) {
        setWorkout(res.data.workout);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  // Helper to display the correct metric (Reps vs Time)
  const getExerciseDetails = (ex: Workout["exercises"][0]) => {
    if (ex.time) return `${ex.time} Seconds`;
    if (ex.sets && ex.reps) return `${ex.sets} Sets × ${ex.reps} Reps`;
    if (ex.sets) return `${ex.sets} Sets`;
    if (ex.reps) return `${ex.reps} Reps`;
    return "1 Set";
  };

  if (loading || !workout) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground pb-32 animate-in fade-in duration-300">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-muted/50 hover:bg-muted"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-bold tracking-widest uppercase text-xs text-muted-foreground">
          Routine Preview
        </span>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-4">
        
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
              <Flame className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h1 className="font-black text-4xl sm:text-5xl tracking-tighter uppercase text-foreground mb-3">
            {workout.workoutName}
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
            <Dumbbell className="w-4 h-4" />
            <span>{workout.exercises.length} Exercises in this routine</span>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Exercise Sequence List */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg tracking-tight mb-2">The Game Plan</h3>
          
          <div className="flex flex-col gap-3">
            {workout.exercises.map((exercise, i) => (
              <div
                key={i}
                className="flex items-center bg-card border border-border hover:border-red-500/30 rounded-2xl p-4 shadow-sm transition-colors"
              >
                {/* Number Badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center font-black text-muted-foreground mr-4">
                  {i + 1}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <p className="font-bold text-lg capitalize text-foreground leading-tight">
                    {exercise.name}
                  </p>
                  <p className="text-sm font-medium text-red-500 mt-0.5 flex items-center gap-1.5">
                    {exercise.time ? <Timer className="w-3.5 h-3.5" /> : <Dumbbell className="w-3.5 h-3.5" />}
                    {getExerciseDetails(exercise)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-xl border-t border-border z-50 pb-safe">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <Link href={`/workout/start/${id}`} className="block">
            <Button className="w-full h-16 rounded-2xl font-black text-xl bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-500/20 transition-transform active:scale-[0.98]">
              <Play className="w-6 h-6 mr-2 fill-current" />
              START WORKOUT
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Page;