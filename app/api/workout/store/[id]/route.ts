import DoneWorkout from "@/models/DoneWorkout";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doneWorkout = await DoneWorkout.findById(id);

    return NextResponse.json(
      {
        message: "Done Workout found",
        doneWorkout,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("error in finding done workout", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
