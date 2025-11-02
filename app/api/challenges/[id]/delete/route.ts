import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Challenge from "@/models/Challenge";
import Friend from "@/models/Friend";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return NextResponse.json("Unable to find challenge", { status: 404 });
    }

   // Only challenger can delete
    if (challenge.challenger.toString() !== userId) {
      return NextResponse.json("Only the challenger can delete", { status: 403 });
    }

    // Allow delete if status is: pending, accepted, or resigned
    const allowedStatuses = ["pending", "accepted", "resigned"];
    if (!allowedStatuses.includes(challenge.status)) {
      return NextResponse.json(
        `Cannot delete challenge in status: ${challenge.status}`,
        { status: 400 }
      );
    }

    await Challenge.deleteOne({ _id: id });

    await Friend.findOneAndUpdate(
      { challenges: id },
      { $pull: { challenges: id } }
    );

  return NextResponse.json({ message: "Challenge deleted permanently" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}