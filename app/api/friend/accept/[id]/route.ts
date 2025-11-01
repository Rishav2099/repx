import { connectToDatabase } from "@/lib/db";
import Friend from "@/models/Friend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const friendRequest = await Friend.findByIdAndUpdate(
      id,
      { status: "accepted" },
      { new: true }
    );

    if (!friendRequest) {
      return NextResponse.json("Friend Request not found", { status: 404 });
    }

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.log("[FRIEND_ACCEPT_POST]", error);
    return new NextResponse("Internal server Error", { status: 500 });
  }
}
