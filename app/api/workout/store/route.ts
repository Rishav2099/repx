import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import DoneWorkout from "@/models/DoneWorkout";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// 1. Define exactly what our database query object will look like
interface WorkoutQuery {
  userId: string;
  createdAt?: {
    $gte: Date;
    $lt: Date;
  };
}

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    // 2. Use the strict interface instead of 'any'
    const query: WorkoutQuery = { userId: session.user.id };

    if (yearParam && monthParam) {
      const year = parseInt(yearParam, 10);
      const month = parseInt(monthParam, 10);

      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 1);

      query.createdAt = { $gte: startDate, $lt: endDate };
    } else {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const workouts = await DoneWorkout.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ workouts }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
      { status: 500 }
    );
  }
}