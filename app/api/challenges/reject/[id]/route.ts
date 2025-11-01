import { connectToDatabase } from "@/lib/db";
import Challenge from "@/models/Challenge";
import Friend from "@/models/Friend";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const challenge = await Challenge.findByIdAndDelete(id);

    if (!challenge) {
      return NextResponse.json("Unable to delete challenge", { status: 404 });
    }

    await Friend.updateOne(
        {challenges: id},
        {$pull: {challenges: id}}
    )

    return NextResponse.json(challenge);
  } catch (error) {
    console.log(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
