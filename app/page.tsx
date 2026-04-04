"use client";

import LandingPage from "@/components/landing-page";
import Loader from "@/components/loader";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import WorkoutDisplay from "@/components/workout/workout-display";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Dumbbell, LogOut } from "lucide-react";

interface Exercise {
  name: string;
  reps?: number;
  sets?: number;
  time?: number;
}

interface Workout {
  _id: string;
  workoutName: string;
  exercises: Exercise[];
}

export default function Home() {
  const { data: session, status } = useSession();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = session?.user?.id;
  const firstName = session?.user?.name?.split(" ")[0] || "Athlete";

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/workout/user/${userId}`);
      setWorkouts(res.data.workouts);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWorkout();
    }
  }, [userId]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Sticky Glassmorphism Navbar */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
          <nav className="flex items-center justify-between max-w-4xl mx-auto px-4 sm:px-6 h-16">
            <h1 className="font-black text-2xl tracking-tighter italic uppercase text-red-600">
              Repx
            </h1>

            <div className="flex gap-2 sm:gap-4 items-center">
              <ModeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </nav>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
          {/* Hero Greeting Section */}
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Welcome back, {firstName}! 👋
            </h2>
            <p className="text-muted-foreground text-lg font-medium">
              Every rep brings you closer to your strongest self.
            </p>
          </div>

          {/* Workouts Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Your Workouts</h3>
            <Link href="/workout/add">
              <Button className="rounded-full font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 transition-transform hover:scale-105 active:scale-95">
                <Plus className="w-4 h-4 mr-1" /> Add Workout
              </Button>
            </Link>
          </div>

          {/* Workouts Feed or Empty State */}
          {workouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workouts.map((workout) => (
                <WorkoutDisplay key={workout._id} workout={workout} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-muted-foreground/20 rounded-3xl bg-muted/5">
              <div className="bg-red-500/10 p-4 rounded-full mb-4">
                <Dumbbell className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="font-bold text-xl mb-2">No workouts yet</h4>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Build your first custom workout and start tracking your progress today.
              </p>
              <Link href="/workout/add">
                <Button size="lg" className="rounded-full font-bold bg-red-600 hover:bg-red-700 text-white">
                  Create Workout
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    );
  }

  return <LandingPage />;
}