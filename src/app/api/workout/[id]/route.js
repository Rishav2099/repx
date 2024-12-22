import { connectToDatabase } from "@/lib/db";
import workout from "@/models/workout";
import { NextResponse } from "next/server";
import exercise from "@/models/exercise";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    // Extract the query parameters from the request URL
    const { id } = await params;
    console.log("Workout ID:", id);

    if (!id) {
      return NextResponse.json(
        { message: "Workout ID is required", success: false, error: true },
        { status: 400 }
      );
    }

    // Fetch the workout by ID and populate the exercises field
    const foundWorkout = await workout.findById({ _id: id }).populate("exercises.exercise");

    if (!foundWorkout) {
      return NextResponse.json(
        { message: "No workout exists", success: false, error: true },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Workout found", success: true, workout: foundWorkout },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching workout:", error.message);
    return NextResponse.json(
      { message: "Internal server error", success: false, error: true },
      { status: 500 }
    );
  }
}

export async function DELETE(request, {params}) {
  try {
    await connectToDatabase()

    const {id} = params

    if (!id) {
      return NextResponse.json(
        {message: 'no id found', success: false, error: true},
        {status:400}
      )
    }

    await workout.findByIdAndDelete({_id: id})
    return NextResponse.json(
      {message: 'workout deleted ', success: true, error: false},
      {status: 200}
    )

  } catch (error) {
    console.error("Error deleting workout:", error.message);
    return NextResponse.json(
      { message: "Internal server error", success: false, error: true },
      { status: 500 }
    );
  }
}
