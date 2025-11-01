import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Friend from "@/models/Friend";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json("User id not found", { status: 400 });
    }

    if (id === userId) {
      return NextResponse.json("Cannot send friend request to yourself", {
        status: 400,
      });
    }

    const existing = await Friend.findOne({
      $or: [
        { requester: userId, recipient: id },
        { requester: id, recipient: userId },
      ],
    });

    if (existing && existing.status !== "rejected") {
      return NextResponse.json("Friend request already exists", {
        status: 400,
      });
    }

    if(existing && existing.status === 'rejected'){
      existing.status = 'pending';
      existing.requester = userId;
      existing.recipient = id;
      await existing.save();
      return NextResponse.json(existing)
    }

    const friend = await Friend.create({
      requester: userId,
      recipient: id,
      status: "pending",
    });

    if (!friend) {
      return NextResponse.json("Unable to make friend request", {
        status: 401,
      });
    }

    await Promise.all([
      User.findByIdAndUpdate(userId, { $addToSet: { friends: friend._id } }),
      User.findByIdAndUpdate(id, { $addToSet: { friends: friend._id } }),
    ]);

    return NextResponse.json(friend);
  } catch (error) {
    console.log("[FRIEND_ADD_POST]", error);
    return new NextResponse("Internal server Error", { status: 500 });
  }
}
