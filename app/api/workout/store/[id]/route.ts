import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import DoneWorkout from "@/models/DoneWorkout";
import { getServerSession } from "next-auth";
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Note: params is a Promise in Next.js 15
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    // Ensure they only delete their own workout
    const deletedWorkout = await DoneWorkout.findOneAndDelete({
      _id: id,
      userId: session.user.id 
    });

    if (!deletedWorkout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Workout deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}