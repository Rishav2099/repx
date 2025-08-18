import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Workout from "@/models/Workout";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { workoutName, exercises } = await req.json();

    if (!workoutName || !exercises) {
      return NextResponse.json("Required fields are missing", { status: 400 });
    }

    await connectToDatabase();

    // 1️⃣ Create new workout
    const newWorkout = await Workout.create({
      workoutName,
      exercises,
      userId: session.user.id
    });

    // 2️⃣ Add workout to user.workouts array
    await User.findByIdAndUpdate(
      session.user.id,
      { $push: { workouts: newWorkout._id } },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Workout saved successfully",
        data: newWorkout,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
