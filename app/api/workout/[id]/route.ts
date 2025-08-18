import { connectToDatabase } from "@/lib/db";
import Workout from "@/models/Workout";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const workout = await Workout.findById(id);

    if (!workout) {
      return NextResponse.json(
        { message: "Workout not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Workout found", workout },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workoutName, exercises } = await req.json();

    if (!workoutName || !exercises) {
      return NextResponse.json("Request fields are missing", { status: 404 });
    }

    await connectToDatabase();

    const workout = await Workout.findByIdAndUpdate(id, {
      workoutName,
      exercises,
    });

    return NextResponse.json(
      {
        message: "Workout edited successfully",
        data: workout,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  res: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    await Workout.findByIdAndDelete(id);

    return NextResponse.json(
      {
        message: "Workout delted successfully",
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
