"use client";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";

interface Workout {
  _id: string;
  workoutName: string;
  exercises: {
    name: string;
    reps: number;
    sets: number;
    time: number;
  }[];
}

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);

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

  // Loader
  if (loading || !workout) {
    return (
        <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="mb-24">
        <h1 className="font-bold text-2xl text-center py-5 md:text-4xl relative">
          {workout.workoutName}
        </h1>
        <Separator />
        <div className="my-5 max-w-[90vw] md:max-w-[80vw] mx-auto ">
          <div className="flex justify-between items-center text-xl font-bold py-4">
            <p>Exercise</p>
            <p>Sets</p>
          </div>
          {workout.exercises.map((exercise, i) => (
            <div
              key={i}
              className="flex justify-between bg-[#b13d404d] rounded-lg border-2 border-red-600 py-2 px-4 my-2"
            >
              <p className="text-lg">
                {exercise.name.charAt(0).toUpperCase()}
                {exercise.name.slice(1)}
              </p>
              <p className="text-lg">{exercise.sets ? exercise.sets : 1}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full py-6 z-10">
        <Separator className="w-full" />
        <div className="flex justify-center items-center mt-3">
          <Link href={`/workout/start/${id}`}>
          <Button className="bg-[#b13d404d] border-2 text-white hover:bg-[#b13d404d] cursor-pointer hover:scale-105 hover:shadow shadow-red-600 border-red-600 py-6 rounded-full">
            START WORKOUT
          </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Page;
