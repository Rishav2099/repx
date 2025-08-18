"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface workoutSchema {
  workoutName: string;
  userId: string;
  duration: number;
  exercises: {
    name: string;
    reps: number;
    sets: number;
    time: number;
  }[];
}

const page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params);
  const [workout, setWorkout] = useState<workoutSchema | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/workout/store/${id}`);
      console.log(res);

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
  }, []);

  if (loading || !workout) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-h-[100vh] flex flex-col justify-between">
      <div className="max-h-[30vh]">
        <h1 className="uppercase font-bold text-2xl text-center py-5">
          Workout completed
        </h1>
        <Separator />
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-center font-bold text-lg py-5">
            {workout.workoutName} Completed
          </h2>
          <p className="text-center font-bold text-lg">
            {Math.round(workout.duration / 60)} Mins
          </p>
        </div>
      </div>
        <ScrollArea className="h-[50vh] w-[80vw] mx-auto border mt-5 p-5">
          <h2 className="font-bold text-xl mb-4">Exercises</h2>
          {workout.exercises.map((exercise, i) => (
            <div
              key={i}
              className="flex justify-between bg-[#b13d404d] rounded-lg border-2 border-red-600 py-2 px-4 my-2"
            >
              <p className="text-lg">
                {exercise.name.charAt(0).toUpperCase()}
                {exercise.name.slice(1)}
              </p>
              <p>
                {exercise.reps
                  ? exercise.reps + " * " + exercise.sets + " Sets"
                  : Math.round(exercise.time / 60) + " Mins"}
              </p>
            </div>
          ))}
        </ScrollArea>
        <div className="flex fixed bottom-0 left-0 right-0 justify-center items-center py-5 ">
            <Link href={'/'} >
            <Button variant={'primary'} className="px-8 py-6 ">
                Done
            </Button>
            </Link>
        </div>
    </div>
  );
};

export default page;
