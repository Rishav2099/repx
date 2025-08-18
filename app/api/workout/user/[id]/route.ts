import { connectToDatabase } from "@/lib/db";
import Workout from "@/models/Workout";
import { NextRequest, NextResponse } from "next/server";

export async function GET (req :NextRequest, {params}: {params: Promise<{id: string}>}) {
  try {
    await connectToDatabase()

    const {id} = await params;

    const workouts = await Workout.find({
      userId: id
    })

    console.log(workouts);
    

    if(!workouts){
      return new NextResponse("No workouts found for user", {status: 400})
    }

    return NextResponse.json({
      message: "Workout found successfully for user",
      workouts
    }, {status: 200})
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Internal server error"
    }, {status: 500})
  }
}