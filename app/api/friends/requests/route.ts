import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Friend from "@/models/Friend";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const friendRequests = await Friend.find({
      recipient: session.user.id,
      status: "pending",
    }).populate("requester", "name");

    console.log(friendRequests);
    

    return NextResponse.json(friendRequests);
  } catch (error) {
    console.error("[FRIEND_REQUESTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
