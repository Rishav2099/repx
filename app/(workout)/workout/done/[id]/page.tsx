"use client";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Timer, Dumbbell, CheckCircle2, Flame } from "lucide-react";

interface workoutSchema {
  workoutName: string;
  userId: string;
  duration: number;
  exercises: {
    name: string;
    reps?: number;
    sets?: number;
    time?: number;
  }[];
}

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [workout, setWorkout] = useState<workoutSchema | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/workout/store/${id}`);
      if (res.status === 200) {
        setWorkout(res.data.doneWorkout);
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

  // Helper to format time precisely
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0 && s > 0) return `${m}m ${s}s`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  };

  if (loading || !workout) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground pb-32">
      
      {/* Victory Hero Section */}
      <div className="pt-12 pb-8 flex flex-col items-center text-center px-4">
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full" />
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-5 rounded-full shadow-2xl shadow-orange-500/20 relative z-10">
            <Trophy className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-black text-4xl sm:text-5xl tracking-tighter uppercase text-foreground mb-2"
        >
          Workout Crushed
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium text-muted-foreground capitalize flex items-center gap-2"
        >
          <Flame className="w-5 h-5 text-red-500" />
          {workout.workoutName} completed
        </motion.p>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Stats Dashboard */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 mb-10"
        >
          <div className="bg-card border border-border rounded-3xl p-5 flex flex-col items-center justify-center shadow-sm">
            <Timer className="w-6 h-6 text-red-500 mb-2" />
            <p className="text-3xl font-black tabular-nums tracking-tight">
              {formatDuration(workout.duration)}
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
              Time Active
            </p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-5 flex flex-col items-center justify-center shadow-sm">
            <Dumbbell className="w-6 h-6 text-red-500 mb-2" />
            <p className="text-3xl font-black tabular-nums tracking-tight">
              {workout.exercises.length}
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
              Exercises
            </p>
          </div>
        </motion.div>

        {/* Exercises Breakdown */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-bold text-lg tracking-tight mb-4 px-1">Performance Summary</h3>
          <div className="flex flex-col gap-3">
            {workout.exercises.map((exercise, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-2xl p-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <p className="font-bold text-lg capitalize text-foreground leading-tight">
                    {exercise.name}
                  </p>
                </div>
                
                <div className="bg-background shadow-sm border border-border px-3 py-1.5 rounded-full">
                  <p className="text-sm font-bold text-muted-foreground">
                    {exercise.reps
                      ? `${exercise.sets} Sets × ${exercise.reps} Reps`
                      : formatDuration(exercise.time || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-xl border-t border-border z-50 pb-safe">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <Link href="/" className="block">
            <Button className="w-full h-16 rounded-2xl font-black text-xl bg-foreground text-background hover:bg-foreground/90 shadow-xl transition-transform active:scale-[0.98]">
              Continue
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Page;