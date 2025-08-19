"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import WorkoutDisplay from "@/components/workout/workout-display";
import axios from "axios";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

  const userId = session?.user.id;

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/workout/user/${userId}`);
      console.log(res)
      setWorkouts(res.data.workouts);
    } catch (error) {
      console.log(error);
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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <nav className="flex justify-between max-w-[90vw] mx-auto py-4">
        <h1 className="font-bold text-2xl">Repx - Counting your reps</h1>

        <div className="flex gap-2 items-center">
          {session ? (
            <>
              <p>Welcome, {session.user?.name || "User"} 👋</p>
              <Button
                variant={"destructive"}
                className="cursor-pointer"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button className="cursor-pointer" onClick={() => signIn()}>
              Login
            </Button>
          )}
          <ModeToggle />
        </div>
      </nav>
      <Separator />

      {/* Motivational Line */}
      <div className="text-center my-8 text-lg font-semibold">
        “Every rep brings you closer to your strongest self 💪”
      </div>

      {/* Workouts Section */}
      <div className="max-w-[90vw] mx-auto">
        {session ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-center">
              Workouts{" "}
              <span className="fixed right-5">
                <Link href={"/workout/add"}>
                  <Button className="cursor-pointer">Add Workout</Button>
                </Link>
              </span>
            </h2>

            {!(workouts.length === 0) ? (
              <>
                <div className="grid gap-4">
                  {workouts.map((workout) => (
                    <WorkoutDisplay key={workout._id} workout={workout} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-10 items-center justify-center">
                <p>No workouts added yet...</p>
                <div className="flex flex-col items-center justify-center gap-5">
                  <p>Add a workout now to become stronger</p>
                  <Link href={"/workout/add"}>
                    <Button className="cursor-pointer">Add workout</Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          <>You are not logged in</>
        )}
      </div>
    </div>
  );
}
