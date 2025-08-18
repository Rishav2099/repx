import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import DoneWorkout from "@/models/DoneWorkout";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();

    const { doneWorkout, duration } = await req.json();

    if (!doneWorkout || !duration) {
      return NextResponse.json("No Workout done", { status: 404 });
    }

    const storedWorkout = await DoneWorkout.create({
      workoutName: doneWorkout.workoutName,
      exercises: doneWorkout.exercises,
      duration,
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        message: "Workout stored successfully",
        storedWorkout,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error storing Done Workout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const now = new Date();

    // Week start (Sunday se)
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday

    // Week end (Saturday tak)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Query workouts between start & end of week
    const workouts = await DoneWorkout.find({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    }).sort({ createdAt: 1 });

    return NextResponse.json({ workouts }, {status: 200});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch current week workouts" },
      { status: 500 }
    );
  }
}
