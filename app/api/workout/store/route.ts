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
    // 1. CRITICAL: Security Check (Only fetch workouts for the logged-in user)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // 2. Extract year and month from the URL query params
    const searchParams = req.nextUrl.searchParams;
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    // 3. Setup the base query (Filter by User ID)
    const query: any = { userId: session.user.id };

    // 4. Handle Date Filtering
    if (yearParam && monthParam) {
      const year = parseInt(yearParam, 10);
      const month = parseInt(monthParam, 10);

      // Start of the requested month
      const startDate = new Date(year, month, 1);
      // Start of the NEXT month (acts as our strict cutoff)
      const endDate = new Date(year, month + 1, 1);

      query.createdAt = { $gte: startDate, $lt: endDate };
    } else {
      // Fallback: If no year/month provided, fetch the current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    // 5. Fetch and Sort (Newest workouts first)
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