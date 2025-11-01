import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Friend from "@/models/Friend";
import "@/models/Challenge"; // 👈 add this line
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const friends = await Friend.find({
      status: "accepted",
      $or: [{ requester: userId }, { recipient: userId }],
    })
      .populate("requester recipient", "_id name")
      .populate({
        path: "challenges",
        model: "Challenge",
        populate: [
          { path: "challenger", select: "_id name" },
          { path: "challengee", select: "_id name" },
        ],
      });

    console.log(friends);

    return NextResponse.json({ friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
